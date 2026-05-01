window.FLOCK_FIREBASE_CONFIG = {"apiKey":"AIzaSyCnIbShg2ra1t4EiP3CffsivwvIK-bNu8M","authDomain":"flockos-theforest.firebaseapp.com","projectId":"flockos-theforest","storageBucket":"flockos-theforest.firebasestorage.app","messagingSenderId":"476522944133","appId":"1:476522944133:web:29ad5d19cf5a84c11b7bec","measurementId":"G-WMGPRHXP0Q"};
window.FLOCK_CHURCH_ID = "theforest";
/* ═══════════════════════════════════════════════════════════════════════
   THE UPPER ROOM — Firebase Firestore Comms Module for FlockOS
   Real-time messaging: DMs, Chat Rooms, Channels, Notifications
   ═══════════════════════════════════════════════════════════════════════ */
;(function() {
  'use strict';

  /* ── Firebase Config ──────────────────────────────────────────────── */
  // Firebase API keys are public identifiers (not secrets).
  // Security is enforced by Firestore security rules, not key secrecy.
  // Per-church override: set window.FLOCK_FIREBASE_CONFIG before loading.
  var _DEFAULT_FIREBASE_CONFIG = {
    apiKey:            'AIzaSyBA-fkxjABbwIHn0i6MPiXbGwahfJmuJeo',
    authDomain:        'flockos-notify.firebaseapp.com',
    projectId:         'flockos-notify',
    storageBucket:     'flockos-notify.firebasestorage.app',
    messagingSenderId: '321766738616',
    appId:             '1:321766738616:web:d2c1c53ad7493fcde4c24d'
  };
  var FIREBASE_CONFIG = (typeof window.FLOCK_FIREBASE_CONFIG === 'object' && window.FLOCK_FIREBASE_CONFIG)
    ? window.FLOCK_FIREBASE_CONFIG
    : _DEFAULT_FIREBASE_CONFIG;

  /* ── State ────────────────────────────────────────────────────────── */
  var _db         = null;   // Firestore instance
  var _auth       = null;   // Firebase Auth instance
  var _churchId   = null;   // e.g. 'FlockOS', 'TheForest'
  var _userEmail  = null;   // logged-in user email
  var _userName   = null;   // logged-in display name
  var _initialized = false; // true once Firebase app + Firestore initialized
  var _ready      = false;  // true once Firebase auth + Firestore ready
  var _listeners  = {};     // active snapshot listeners (keyed by path)
  var _unreadDM   = 0;      // unread DM count
  var _unreadRoom = 0;      // unread room count
  var _permModulesCache = null; // session cache for static permissionModules config doc

  /* ── Timeout constant ───────────────────────────────────────────── */
  var FIRESTORE_TIMEOUT_MS = 8000; // 8 seconds — Firestore reads are typically sub-second

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function _now()    { return firebase.firestore.FieldValue.serverTimestamp(); }
  function _ts(d)    { return d && d.toDate ? d.toDate() : (d ? new Date(d) : new Date()); }
  function _uid()    { return _db.collection('_').doc().id; }

  /**
   * Wrap any promise with a timeout.  If the promise doesn't settle
   * within `ms` milliseconds, reject with a user-friendly message.
   * @param {Promise} p   — the underlying promise (e.g. Firestore .get())
   * @param {number}  ms  — timeout in ms (default FIRESTORE_TIMEOUT_MS)
   * @param {string}  label — optional context for the error message
   */
  function _withTimeout(p, ms, label) {
    ms = ms || FIRESTORE_TIMEOUT_MS;
    return Promise.race([
      p,
      new Promise(function(_, reject) {
        setTimeout(function() {
          reject(new Error(
            (label || 'Request') + ' timed out after ' + (ms / 1000) + 's. Check your connection and try again.'
          ));
        }, ms);
      })
    ]);
  }

  function _churchRef() {
    // Collections live at the root of each church's own Firebase project —
    // no churches/{churchId}/ nesting needed; the project IS the boundary.
    return _db;
  }
  var _churchDoc = _churchRef;

  /* ── Universal pagination helper ──────────────────────────────────── */
  var _DEFAULT_PAGE = 25;
  /**
   * Apply startAfter cursor + limit to a query, execute, and return either
   * a plain array (legacy callers) or { results, lastDoc, hasMore, total? }.
   *   q      – Firestore query (already has orderBy)
   *   opts   – caller opts: { limit, startAfter, paginate, ...extras }
   *   mapFn  – optional: function(doc) → row  (default: doc.data() + id)
   */
  function _paginatedGet(q, opts, mapFn) {
    opts = opts || {};
    var lim = opts.limit || _DEFAULT_PAGE;
    q = q.limit(lim);
    if (opts.startAfter) q = q.startAfter(opts.startAfter);
    var _map = mapFn || function(doc) { var d = doc.data(); d.id = doc.id; return d; };
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) { results.push(_map(doc)); });
      if (!opts.startAfter && !opts.paginate) return results;
      return {
        results: results,
        lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null,
        hasMore: snap.docs.length === lim
      };
    });
  }

  function _convosRef() {
    return _churchRef().collection('conversations');
  }

  /* ── Escaping (reuse FlockOS _e if available) ─────────────────────── */
  function _e(s) {
    if (typeof window._e === 'function') return window._e(s);
    var el = document.createElement('span');
    el.textContent = s || '';
    return el.innerHTML;
  }

  /* ── Time Ago ─────────────────────────────────────────────────────── */
  function _timeAgo(ts) {
    if (!ts) return '';
    var d = _ts(ts);
    var diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString();
  }

  /* ── Init ─────────────────────────────────────────────────────────── */
  function init(config) {
    console.log('[FLOCK-DEBUG] UpperRoom.init() called — _initialized=' + _initialized);
    if (_initialized) return Promise.resolve();
    _initialized = true;

    // Accept optional config override
    if (config) FIREBASE_CONFIG = config;

    // Firebase SDK must be loaded
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.warn('[FLOCK-DEBUG] UpperRoom.init() — Firebase SDK NOT LOADED');
      _initialized = false;
      return Promise.reject(new Error('Firebase SDK not available'));
    }

    // Initialize Firebase app (idempotent)
    if (!firebase.apps.length) {
      console.log('[FLOCK-DEBUG] UpperRoom.init() — initializing Firebase app, projectId=' + (FIREBASE_CONFIG ? FIREBASE_CONFIG.projectId : 'NONE'));
      firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      console.log('[FLOCK-DEBUG] UpperRoom.init() — Firebase app already exists, projectId=' + firebase.apps[0].options.projectId);
    }
    _db   = firebase.firestore();
    _auth = firebase.auth();

    // Safari's WebChannel streaming transport can stall for ~30s on collection
    // queries before falling back to long polling. This setting detects the
    // stall and falls back immediately instead of waiting for the timeout.
    try { _db.settings({ experimentalAutoDetectLongPolling: true, merge: true }); } catch (_) {}

    console.log('[FLOCK-DEBUG] UpperRoom.init() — Firestore and Auth initialized, churchId=' + _resolveChurchId());

    // Resolve churchId early so _churchRef() works even before authenticate()
    _churchId = _resolveChurchId();

    // Monitor token refreshes — custom claims (churchId, role) are NOT
    // persisted through automatic ID token refresh (~1 hour).  When the
    // refreshed token loses them, Firestore rules start rejecting reads.
    // This listener detects the loss and silently re-mints a custom token.
    var _reAuthInFlight = false;
    _auth.onIdTokenChanged(function(user) {
      if (!user || _reAuthInFlight) return;
      user.getIdTokenResult().then(function(result) {
        if (!result.claims || !result.claims.churchId) {
          _reAuthInFlight = true;
          _ready = false;
          _mintAndSignIn()
            .then(function()  { _reAuthInFlight = false; })
            .catch(function() { _reAuthInFlight = false; });
        }
      }).catch(function() {});
    });

    return Promise.resolve();
  }

  /* ── Authenticate via Custom Token from Apps Script ────────────── */
  function authenticate() {
    console.log('[FLOCK-DEBUG] UpperRoom.authenticate() called — _ready=' + _ready + ', hasCurrentUser=' + !!(_auth && _auth.currentUser));
    // Get session from FlockOS auth
    var session = null;
    if (typeof Nehemiah !== 'undefined' && Nehemiah.getSession) {
      session = Nehemiah.getSession();
    } else if (typeof TheVine !== 'undefined' && TheVine.session) {
      session = TheVine.session();
    }
    if (!session || !session.email) {
      console.error('[FLOCK-DEBUG] UpperRoom.authenticate() — NO SESSION, rejecting');
      return Promise.reject(new Error('No FlockOS session'));
    }

    _userEmail = session.email;
    _userName  = session.displayName || session.email;
    console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — email=' + _userEmail + ', churchId=' + _resolveChurchId());

    // Determine churchId from page context
    _churchId = _resolveChurchId();

    // Wait for Firebase Auth to finish restoring any persisted session from
    // IndexedDB. currentUser is null until this resolves, even if the user
    // was previously signed in.
    return new Promise(function(resolve, reject) {
      var _unsub = _auth.onAuthStateChanged(function(user) {
        _unsub(); // only need the first callback
        console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — onAuthStateChanged fired, user=' + (user ? user.uid : 'null'));

        if (user) {
          // Firebase persisted a session — verify custom claims are still present
          console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — restored user, checking claims…');
          _withTimeout(
            user.getIdTokenResult()
              .then(function(result) {
                console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — claims: churchId=' + (result.claims ? result.claims.churchId : 'NONE') + ', role=' + (result.claims ? result.claims.role : 'NONE'));
                if (result.claims && result.claims.churchId) {
                  _ready = true;
                  console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — FAST PATH: reusing persisted session (no GAS call)');
                  return;  // claims intact — no re-auth needed
                }
                // Claims lost after token refresh — get a fresh custom token
                console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — claims LOST, re-minting…');
                return _mintAndSignIn();
              }),
            30000, 'Firebase authentication'
          ).then(resolve).catch(reject);
        } else {
          // No persisted session — full sign-in via GAS
          console.log('[FLOCK-DEBUG] UpperRoom.authenticate() — not signed in, calling _mintAndSignIn()…');
          _mintAndSignIn().then(resolve).catch(reject);
        }
      });
    });
  }

  /* ── Mint a fresh custom token from GAS and sign in ────────────── */
  function _mintAndSignIn() {
    console.log('[FLOCK-DEBUG] _mintAndSignIn() calling TheVine.flock.firebase.token({ churchId: ' + _churchId + ' })…');
    var _mintStart = Date.now();
    return TheVine.flock.firebase.token({ churchId: _churchId })
      .then(function(res) {
        var token = res && (res.token || res.customToken);
        console.log('[FLOCK-DEBUG] _mintAndSignIn() token received in ' + (Date.now() - _mintStart) + 'ms — hasToken=' + !!token + ', tokenLength=' + (token ? token.length : 0));
        if (!token) throw new Error('No custom token returned from GAS');
        console.log('[FLOCK-DEBUG] _mintAndSignIn() calling signInWithCustomToken…');
        return _auth.signInWithCustomToken(token);
      })
      .then(function() {
        _ready = true;
        console.log('[FLOCK-DEBUG] _mintAndSignIn() SUCCESS — _ready=true, uid=' + (_auth.currentUser ? _auth.currentUser.uid : 'N/A'));
      })
      .catch(function(err) {
        console.error('[FLOCK-DEBUG] _mintAndSignIn() FAILED:', err);
        // Re-throw with the Firebase error code included so callers can surface it
        var code = err && err.code ? ' (' + err.code + ')' : '';
        throw new Error((err && err.message ? err.message : String(err)) + code);
      });
  }

  /* ── Resolve churchId from page/config ────────────────────────── */
  function _resolveChurchId() {
    // Try build-injected church ID (window.FLOCK_CHURCH_ID set by A-Build_Churches.sh)
    if (typeof window.FLOCK_CHURCH_ID === 'string' && window.FLOCK_CHURCH_ID) return window.FLOCK_CHURCH_ID;
    // Try manifest short_name
    try {
      var meta = document.querySelector('meta[name="church-id"]');
      if (meta) return meta.content;
    } catch (_) {}
    // Try URL path: /Covenant/Nations/TheForest/ -> TheForest
    var m = window.location.pathname.match(/\/Covenant\/Nations\/([^/]+)\//);
    if (m) return m[1];
    // Backward compatibility for older deployment paths.
    m = window.location.pathname.match(/\/Church\/([^/]+)\//);
    if (m) return m[1];
    // Default FlockOS
    return 'FlockOS';
  }

  /* ══════════════════════════════════════════════════════════════════
     CONVERSATIONS — unified: DMs, Rooms, Channels
     ══════════════════════════════════════════════════════════════════ */

  /* ── Create a DM conversation ───────────────────────────────────── */
  function createDM(recipientEmail, recipientName) {
    // Check for existing DM between these two users
    var participants = [_userEmail, recipientEmail].sort();
    var dmId = 'dm_' + participants.join('_').replace(/[^a-zA-Z0-9_]/g, '-');

    return _convosRef().doc(dmId).get().then(function(doc) {
      if (doc.exists) return doc.id;
      return _convosRef().doc(dmId).set({
        type:         'dm',
        participants: participants,
        participantNames: _buildNameMap(recipientEmail, recipientName),
        createdBy:    _userEmail,
        createdAt:    _now(),
        lastMessageAt: _now(),
        lastSnippet:  '',
        unreadBy:     []
      }).then(function() { return dmId; });
    });
  }

  /* ── Create a Chat Room ─────────────────────────────────────────── */
  function createRoom(name, description, memberEmails) {
    var roomId = _uid();
    var allMembers = [_userEmail].concat(memberEmails || []);
    // Deduplicate
    var seen = {};
    allMembers = allMembers.filter(function(e) {
      if (seen[e]) return false;
      seen[e] = true;
      return true;
    });

    return _convosRef().doc(roomId).set({
      type:         'room',
      name:         name || 'New Room',
      description:  description || '',
      participants: allMembers,
      createdBy:    _userEmail,
      createdAt:    _now(),
      lastMessageAt: _now(),
      lastSnippet:  '',
      memberCount:  allMembers.length,
      unreadBy:     []
    }).then(function() { return roomId; });
  }

  /* ── Create a Channel (broadcast) ───────────────────────────────── */
  function createChannel(name, description) {
    var channelId = _uid();
    return _convosRef().doc(channelId).set({
      type:            'channel',
      name:            name || 'New Channel',
      description:     description || '',
      subscribers:     [_userEmail],
      createdBy:       _userEmail,
      createdAt:       _now(),
      lastMessageAt:   _now(),
      lastSnippet:     '',
      subscriberCount: 1,
      postPermission:  'admin',  // 'admin', 'leader', 'anyone'
      unreadBy:        []
    }).then(function() { return channelId; });
  }

  /* ── List conversations by type ─────────────────────────────────── */
  function listConversations(type) {
    return _convosRef()
      .where(type === 'channel' ? 'subscribers' : 'participants', 'array-contains', _userEmail)
      .where('type', '==', type)
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        return results;
      });
  }

  /* ── Listen to conversation list (real-time) ────────────────────── */
  function listenConversations(type, callback) {
    var key = 'list_' + type;
    _unlisten(key);

    var field = type === 'channel' ? 'subscribers' : 'participants';
    _listeners[key] = _convosRef()
      .where(field, 'array-contains', _userEmail)
      .where('type', '==', type)
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .onSnapshot(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        callback(results);
      }, function(err) {
        console.error('[UpperRoom] listenConversations error:', err);
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     MESSAGES
     ══════════════════════════════════════════════════════════════════ */

  /* ── Send a message ─────────────────────────────────────────────── */
  function sendMessage(convoId, body, opts) {
    opts = opts || {};
    var msgId = _uid();
    var msgRef = _convosRef().doc(convoId).collection('messages').doc(msgId);
    var convoRef = _convosRef().doc(convoId);

    var msgData = {
      body:        body,
      senderEmail: _userEmail,
      senderName:  _userName,
      sentAt:      _now(),
      replyTo:     opts.replyTo || null,
      attachmentUrl:  opts.attachmentUrl || null,
      attachmentName: opts.attachmentName || null
    };

    var snippet = body.length > 80 ? body.substring(0, 80) + '…' : body;

    // Batch: write message + update conversation metadata.
    // Use set({ merge: true }) instead of update() so the conversation doc
    // is created automatically if it doesn't exist (e.g. #prayer-chain seeded
    // by name but never explicitly created via createChannel).
    var batch = _db.batch();
    batch.set(msgRef, msgData);
    batch.set(convoRef, {
      lastMessageAt: _now(),
      lastSnippet:   snippet,
      lastSenderName: _userName
    }, { merge: true });
    return batch.commit().then(function() {
      return msgId;
    });
  }

  /* ── Fetch messages (one-time) ──────────────────────────────────── */
  function getMessages(convoId, limitN) {
    return _convosRef().doc(convoId).collection('messages')
      .orderBy('sentAt', 'asc')
      .limit(limitN || 100)
      .get()
      .then(function(snap) {
        var msgs = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          msgs.push(d);
        });
        return msgs;
      });
  }

  /* ── Listen to messages (real-time) ─────────────────────────────── */
  function listenMessages(convoId, callback) {
    var key = 'msgs_' + convoId;
    _unlisten(key);

    _listeners[key] = _convosRef().doc(convoId).collection('messages')
      .orderBy('sentAt', 'asc')
      .limitToLast(100)
      .onSnapshot(function(snap) {
        var msgs = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          msgs.push(d);
        });
        callback(msgs);
      }, function(err) {
        console.error('[UpperRoom] listenMessages error:', err);
      });
  }

  /* ── Delete a message ───────────────────────────────────────────── */
  function deleteMessage(convoId, msgId) {
    return _convosRef().doc(convoId).collection('messages').doc(msgId).delete();
  }

  /* ══════════════════════════════════════════════════════════════════
     ROOM / CONVERSATION MANAGEMENT
     ══════════════════════════════════════════════════════════════════ */

  /* ── Join a room ────────────────────────────────────────────────── */
  function joinRoom(convoId) {
    return _convosRef().doc(convoId).update({
      participants: firebase.firestore.FieldValue.arrayUnion(_userEmail),
      memberCount:  firebase.firestore.FieldValue.increment(1)
    });
  }

  /* ── Leave a room ───────────────────────────────────────────────── */
  function leaveRoom(convoId) {
    return _convosRef().doc(convoId).update({
      participants: firebase.firestore.FieldValue.arrayRemove(_userEmail),
      memberCount:  firebase.firestore.FieldValue.increment(-1)
    });
  }

  /* ── Add participant ────────────────────────────────────────────── */
  function addParticipant(convoId, email) {
    return _convosRef().doc(convoId).update({
      participants: firebase.firestore.FieldValue.arrayUnion(email),
      memberCount:  firebase.firestore.FieldValue.increment(1)
    });
  }

  /* ── Update room/channel metadata ───────────────────────────────── */
  function updateConversation(convoId, data) {
    return _convosRef().doc(convoId).update(data);
  }

  /* ── Archive conversation ───────────────────────────────────────── */
  function archiveConversation(convoId) {
    return _convosRef().doc(convoId).update({ status: 'archived' });
  }

  /* ── Delete conversation (pastor/admin only) ────────────────────── */
  function deleteConversation(convoId) {
    return _convosRef().doc(convoId).delete();
  }

  /* ── Get a single conversation ──────────────────────────────────── */
  function getConversation(convoId) {
    return _convosRef().doc(convoId).get().then(function(doc) {
      if (!doc.exists) return null;
      var d = doc.data();
      d.id = doc.id;
      return d;
    });
  }

  /* ── Create a Group Thread ─────────────────────────────────────────── */
  function createThread(subject, memberEmails, firstMessage) {
    var threadId = _uid();
    var allMembers = [_userEmail].concat(memberEmails || []);
    var seen = {};
    allMembers = allMembers.filter(function(e) {
      if (!e || seen[e]) return false;
      seen[e] = true;
      return true;
    });
    var snippet = firstMessage
      ? (firstMessage.length > 80 ? firstMessage.substring(0, 80) + '…' : firstMessage)
      : '';
    return _convosRef().doc(threadId).set({
      type:          'thread',
      subject:       subject || 'New Thread',
      participants:  allMembers,
      createdBy:     _userEmail,
      createdAt:     _now(),
      lastMessageAt: _now(),
      lastSnippet:   snippet,
      memberCount:   allMembers.length,
      unreadBy:      []
    }).then(function() {
      if (!firstMessage) return threadId;
      return sendMessage(threadId, firstMessage).then(function() { return threadId; });
    });
  }

  /* ── Conversations I started (Sent view) ────────────────────────────── */
  function listSentConversations() {
    return _convosRef()
      .where('createdBy', '==', _userEmail)
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data(); d.id = doc.id; results.push(d);
        });
        return results;
      });
  }

  /* ── App-level settings (comms mode per church) ─────────────────────── */
  function getCommsMode() {
    console.log('[FLOCK-DEBUG] UpperRoom.getCommsMode() querying settings/app…');
    var _gcmStart = Date.now();
    return _churchRef().collection('settings').doc('app')
      .get()
      .then(function(doc) {
        var mode = !doc.exists ? 'firebase' : (doc.data().commsMode || 'firebase');
        console.log('[FLOCK-DEBUG] UpperRoom.getCommsMode() RESULT: ' + mode + ' (exists=' + doc.exists + ', ' + (Date.now() - _gcmStart) + 'ms)');
        return mode;
      })
      .catch(function(err) {
        console.error('[FLOCK-DEBUG] UpperRoom.getCommsMode() ERROR:', err);
        return 'firebase';
      });
  }

  function setCommsMode(mode) {
    return _churchRef().collection('settings').doc('app')
      .set({ commsMode: mode }, { merge: true });
  }

  /* ── Browse available rooms (discoverable) ──────────────────────── */
  function browseRooms() {
    return _convosRef()
      .where('type', '==', 'room')
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var rooms = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          if (d.status !== 'archived') rooms.push(d);
        });
        return rooms;
      });
  }

  /* ── Browse all channels (discoverable) ─────────────────────────── */
  function browseChannels() {
    return _convosRef()
      .where('type', '==', 'channel')
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var channels = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          d.memberCount = d.subscriberCount || (d.subscribers ? d.subscribers.length : 0);
          if (d.status !== 'archived') channels.push(d);
        });
        return channels;
      });
  }

  /* ── Subscribe / unsubscribe channel ────────────────────────────── */
  function subscribeChannel(channelId) {
    return _convosRef().doc(channelId).update({
      subscribers:     firebase.firestore.FieldValue.arrayUnion(_userEmail),
      subscriberCount: firebase.firestore.FieldValue.increment(1)
    });
  }

  function unsubscribeChannel(channelId) {
    return _convosRef().doc(channelId).update({
      subscribers:     firebase.firestore.FieldValue.arrayRemove(_userEmail),
      subscriberCount: firebase.firestore.FieldValue.increment(-1)
    });
  }

  /* ── Post to channel (creates a message in the channel convo) ───── */
  function postToChannel(channelId, subject, body) {
    var msgBody = subject ? ('**' + subject + '**\n\n' + body) : body;
    return sendMessage(channelId, msgBody);
  }

  /* ══════════════════════════════════════════════════════════════════
     TEMPLATES — churches/{churchId}/templates
     ══════════════════════════════════════════════════════════════════ */

  function _templatesRef() {
    return _churchRef().collection('templates');
  }

  function listTemplates() {
    return _templatesRef()
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()
      .then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        return results;
      });
  }

  function getTemplate(id) {
    return _templatesRef().doc(id).get().then(function(doc) {
      if (!doc.exists) return null;
      var d = doc.data();
      d.id = doc.id;
      return d;
    });
  }

  function createTemplate(data) {
    var id = _uid();
    return _templatesRef().doc(id).set({
      name:      data.name || '',
      category:  data.category || '',
      subject:   data.subject || '',
      body:      data.body || '',
      createdBy: _userEmail,
      createdAt: _now(),
      updatedAt: _now()
    }).then(function() { return id; });
  }

  function updateTemplate(id, data) {
    data.updatedAt = _now();
    return _templatesRef().doc(id).update(data);
  }

  function deleteTemplate(id) {
    return _templatesRef().doc(id).delete();
  }

  /* ══════════════════════════════════════════════════════════════════
     BROADCASTS — churches/{churchId}/broadcasts
     ══════════════════════════════════════════════════════════════════ */

  function _broadcastsRef() {
    return _churchRef().collection('broadcasts');
  }

  function listBroadcasts(limitN) {
    return _broadcastsRef()
      .orderBy('createdAt', 'desc')
      .limit(limitN || 50)
      .get()
      .then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        return results;
      });
  }

  function createBroadcast(data) {
    var id = _uid();
    return _broadcastsRef().doc(id).set({
      subject:        data.subject || '',
      body:           data.body || data.message || '',
      audience:       data.audience || 'all',
      recipientCount: data.recipientCount || 0,
      openCount:      0,
      status:         'sent',
      sentBy:         _userEmail,
      createdAt:      _now()
    }).then(function() { return id; });
  }

  /* ══════════════════════════════════════════════════════════════════
     NOTIFICATION PREFERENCES — churches/{churchId}/settings/notifPrefs_{email}
     ══════════════════════════════════════════════════════════════════ */

  function _notifPrefsDocId() {
    return 'notifPrefs_' + _userEmail.replace(/[^a-zA-Z0-9]/g, '-');
  }

  function getNotifPrefs() {
    return _churchRef().collection('settings').doc(_notifPrefsDocId())
      .get()
      .then(function(doc) {
        if (!doc.exists) return {};
        return doc.data();
      })
      .catch(function() { return {}; });
  }

  function updateNotifPrefs(prefs) {
    return _churchRef().collection('settings').doc(_notifPrefsDocId())
      .set(prefs, { merge: true });
  }

  /* ══════════════════════════════════════════════════════════════════
     PRAYER REQUESTS — churches/{churchId}/prayers
     ══════════════════════════════════════════════════════════════════ */

  function _prayersRef() {
    return _churchRef().collection('prayers');
  }

  function listPrayers(opts) {
    opts = opts || {};
    console.log('[FLOCK-DEBUG] UpperRoom.listPrayers() called — allUsers=' + !!opts.allUsers + ', _userEmail=' + _userEmail + ', _ready=' + _ready + ', hasDb=' + !!_db);
    var q = _prayersRef();
    // Filter by current user's email unless opts.allUsers is set (admin/pastor).
    // Firestore rules require createdBy == userEmail() or isConfidential != true;
    // without a matching .where(), the query is rejected for non-pastor users
    // and the .catch(() => []) silently returns an empty array.
    if (!opts.allUsers && _userEmail) {
      q = q.where('createdBy', '==', _userEmail);
    }
    q = q.orderBy('submittedAt', 'desc').limit(opts.limit || _DEFAULT_PAGE);
    if (opts.startAfter) q = q.startAfter(opts.startAfter);
    console.log('[FLOCK-DEBUG] UpperRoom.listPrayers() executing query…');
    var _lpStart = Date.now();
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        d.id = doc.id;
        results.push(d);
      });
      console.log('[FLOCK-DEBUG] UpperRoom.listPrayers() DONE: ' + results.length + ' rows in ' + (Date.now() - _lpStart) + 'ms');
      if (!opts.startAfter && !opts.paginate) return results;
      return { results: results, lastDoc: snap.docs.length ? snap.docs[snap.docs.length - 1] : null, hasMore: snap.docs.length === (opts.limit || _DEFAULT_PAGE) };
    });
  }


  function countOpenPrayers() {
    return _prayersRef()
      .where('status', 'not-in', ['answered','closed','archived'])
      .get().then(function(snap) { return snap.size; });
  }
  function getPrayer(id) {
    return _prayersRef().doc(id).get().then(function(doc) {
      if (!doc.exists) return null;
      var d = doc.data();
      d.id = doc.id;
      return d;
    });
  }

  function createPrayer(data) {
    var id = _uid();
    // Auto-assign to lead pastor from AppConfig if not explicitly assigned
    return getAppConfig({ key: 'LEAD_PASTOR_MEMBER_ID' }).then(function(cfg) {
      var defaultAssignee = (cfg && cfg.value) ? String(cfg.value).trim() : '';
      return _prayersRef().doc(id).set({
        submitterName:     data.submitterName || 'Anonymous',
        submitterEmail:    data.submitterEmail || _userEmail,
        submitterPhone:    data.submitterPhone || '',
        prayerText:        data.prayerText || '',
        category:          data.category || '',
        status:            'New',
        isConfidential:    data.isConfidential || 'FALSE',
        followUpRequested: data.followUpRequested || 'FALSE',
        assignedTo:        data.assignedTo || defaultAssignee || '',
        adminNotes:        '',
        createdBy:         _userEmail,
        submittedAt:       _now(),
        lastUpdated:       _now(),
        updatedBy:         _userEmail
      }).then(function() { return id; });
    }).catch(function() {
      // If AppConfig lookup fails, still create the prayer (unassigned)
      return _prayersRef().doc(id).set({
        submitterName:     data.submitterName || 'Anonymous',
        submitterEmail:    data.submitterEmail || _userEmail,
        submitterPhone:    data.submitterPhone || '',
        prayerText:        data.prayerText || '',
        category:          data.category || '',
        status:            'New',
        isConfidential:    data.isConfidential || 'FALSE',
        followUpRequested: data.followUpRequested || 'FALSE',
        assignedTo:        data.assignedTo || '',
        adminNotes:        '',
        createdBy:         _userEmail,
        submittedAt:       _now(),
        lastUpdated:       _now(),
        updatedBy:         _userEmail
      }).then(function() { return id; });
    });
  }

  function updatePrayer(id, data) {
    data.lastUpdated = _now();
    data.updatedBy   = _userEmail;
    return _prayersRef().doc(id).update(data);
  }

  function deletePrayer(id) {
    return _prayersRef().doc(id).delete();
  }

  function listPrayerInteractions(prayerId) {
    return _prayersRef().doc(prayerId).collection('interactions')
      .orderBy('createdAt', 'desc').limit(100).get()
      .then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function addPrayerInteraction(prayerId, data) {
    var rec = Object.assign({}, data, { createdAt: _now(), createdBy: _userEmail });
    return _prayersRef().doc(prayerId).collection('interactions').add(rec)
      .then(function(ref) { return Object.assign({ id: ref.id }, rec); });
  }

  /* ── Listen to prayers (real-time for public wall) ──────────────── */
  function listenPrayers(callback) {
    var key = 'prayers';
    _unlisten(key);

    _listeners[key] = _prayersRef()
      .orderBy('submittedAt', 'desc')
      .limit(100)
      .onSnapshot(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        callback(results);
      }, function(err) {
        console.error('[UpperRoom] listenPrayers error:', err);
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     TODOS / TASKS — churches/{churchId}/todos
     ══════════════════════════════════════════════════════════════════ */

  function _todosRef() {
    return _churchRef().collection('todos');
  }

  function listTodos(opts) {
    opts = opts || {};
    var q = _todosRef().orderBy('createdAt', 'desc');
    return _paginatedGet(q, opts);
  }

  function myTodos() {
    return _todosRef()
      .where('assignedTo', '==', _userEmail)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()
      .then(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        return results;
      });
  }

  function createTodo(data) {
    var id = _uid();
    return _todosRef().doc(id).set({
      title:          data.title || '',
      description:    data.description || '',
      dueDate:        data.dueDate || '',
      priority:       data.priority || 'Medium',
      status:         data.status || 'Not Started',
      category:       data.category || 'Other',
      recurring:      data.recurring === 'true' || data.recurring === true,
      recurrenceRule: data.recurrenceRule || '',
      assignedTo:     data.assignedTo || _userEmail,
      entityType:     data.entityType || '',
      entityId:       data.entityId || '',
      notes:          data.notes || '',
      createdBy:      _userEmail,
      createdAt:      _now(),
      updatedAt:      _now()
    }).then(function() { return id; });
  }

  function updateTodo(id, data) {
    data.updatedAt = _now();
    return _todosRef().doc(id).update(data);
  }

  function completeTodo(id) {
    return _todosRef().doc(id).update({
      status:      'Done',
      completedAt: _now(),
      updatedAt:   _now()
    });
  }

  function archiveTodo(id) {
    return _todosRef().doc(id).update({
      status:    'Archived',
      updatedAt: _now()
    });
  }

  function unarchiveTodo(id) {
    return _todosRef().doc(id).update({
      status:    'Not Started',
      updatedAt: _now()
    });
  }

  function deleteTodo(id) {
    return _todosRef().doc(id).delete();
  }

  /* ── Listen to todos (real-time) ────────────────────────────────── */
  function listenTodos(callback) {
    var key = 'todos';
    _unlisten(key);

    _listeners[key] = _todosRef()
      .orderBy('createdAt', 'desc')
      .limit(200)
      .onSnapshot(function(snap) {
        var results = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          results.push(d);
        });
        callback(results);
      }, function(err) {
        console.error('[UpperRoom] listenTodos error:', err);
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     NOTIFICATIONS
     ══════════════════════════════════════════════════════════════════ */

  function _notifsRef() {
    return _churchRef().collection('notifications');
  }

  /* ── Create notification ────────────────────────────────────────── */
  function createNotification(recipientEmail, title, body, entityType, entityId) {
    return _notifsRef().add({
      recipientEmail: recipientEmail,
      title:          title,
      body:           body,
      entityType:     entityType || 'message',
      entityId:       entityId || '',
      read:           false,
      createdAt:      _now()
    });
  }

  /* ── Listen to my notifications (real-time) ─────────────────────── */
  function listenNotifications(callback) {
    var key = 'my_notifs';
    _unlisten(key);

    _listeners[key] = _notifsRef()
      .where('recipientEmail', '==', _userEmail)
      .where('read', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .onSnapshot(function(snap) {
        var notifs = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          notifs.push(d);
        });
        callback(notifs);
      });
  }

  /* ── Mark notification read ─────────────────────────────────────── */
  function markNotifRead(notifId) {
    return _notifsRef().doc(notifId).update({ read: true, readAt: _now() });
  }

  /* ── Mark all notifications read ────────────────────────────────── */
  function markAllNotifsRead() {
    return _notifsRef()
      .where('recipientEmail', '==', _userEmail)
      .where('read', '==', false)
      .get()
      .then(function(snap) {
        var batch = _db.batch();
        snap.forEach(function(doc) {
          batch.update(doc.ref, { read: true, readAt: _now() });
        });
        return batch.commit();
      });
  }

  /* ── Unread count ───────────────────────────────────────────────── */
  function getUnreadCount() {
    return _notifsRef()
      .where('recipientEmail', '==', _userEmail)
      .where('read', '==', false)
      .get()
      .then(function(snap) { return snap.size; });
  }

  /* ── List notifications (one-shot) ──────────────────────────────── */
  function listNotifications(opts) {
    opts = opts || {};
    return _notifsRef()
      .where('recipientEmail', '==', _userEmail)
      .orderBy('createdAt', 'desc')
      .limit(opts.limit || 60)
      .get()
      .then(function(snap) {
        var out = [];
        snap.forEach(function(d) { var o = d.data(); o.id = d.id; out.push(o); });
        return out;
      });
  }

  /* ── Dismiss (delete) a notification ────────────────────────────── */
  function dismissNotification(notifId) {
    return _notifsRef().doc(notifId).delete();
  }

  /* ══════════════════════════════════════════════════════════════════
     TYPING INDICATORS (ephemeral — auto-expire)
     ══════════════════════════════════════════════════════════════════ */

  function setTyping(convoId, isTyping) {
    var ref = _convosRef().doc(convoId).collection('typing').doc(_userEmail);
    if (isTyping) {
      return ref.set({ name: _userName, at: _now() });
    }
    return ref.delete().catch(function() {});
  }

  function listenTyping(convoId, callback) {
    var key = 'typing_' + convoId;
    _unlisten(key);

    _listeners[key] = _convosRef().doc(convoId).collection('typing')
      .onSnapshot(function(snap) {
        var typers = [];
        snap.forEach(function(doc) {
          if (doc.id !== _userEmail) {
            var d = doc.data();
            // Only show if typed within last 10 seconds
            var at = d.at && d.at.toDate ? d.at.toDate() : null;
            if (at && (Date.now() - at.getTime()) < 10000) {
              typers.push(d.name || doc.id);
            }
          }
        });
        callback(typers);
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     CLEANUP
     ══════════════════════════════════════════════════════════════════ */

  function _unlisten(key) {
    if (_listeners[key]) {
      _listeners[key]();
      delete _listeners[key];
    }
  }

  function detachAll() {
    Object.keys(_listeners).forEach(function(k) {
      if (typeof _listeners[k] === 'function') _listeners[k]();
    });
    _listeners = {};
  }

  function signOut() {
    detachAll();
    _ready = false;
    if (_auth) return _auth.signOut();
    return Promise.resolve();
  }

  /* ── Name map helper ────────────────────────────────────────────── */
  function _buildNameMap(email, name) {
    var map = {};
    map[_userEmail] = _userName;
    if (email && name) map[email] = name;
    return map;
  }

  /* ══════════════════════════════════════════════════════════════════
     USERS — churches/{churchId}/users
     ══════════════════════════════════════════════════════════════════ */

  function _usersRef() {
    return _churchRef().collection('users');
  }

  function listUsers() { return Promise.reject('User admin moved to GAS — use TheVine.flock.users.list()'); }
  function getUser()   { return Promise.reject('User admin moved to GAS'); }

  // ── User admin functions REMOVED ─────────────────────────────────────
  // User administration (create, update, approve, deny, reset passcode)
  // is now handled exclusively by GAS (TheVine) to ensure passwords are
  // hashed server-side and auth data never enters Firestore.
  // See: the_shepherd.js, the_tabernacle.js, the_life.js → TheVine.flock.users.*

  function createUser()    { return Promise.reject('User admin moved to GAS — use TheVine.flock.users.create()'); }
  function updateUser()    { return Promise.reject('User admin moved to GAS — use TheVine.flock.users.update()'); }
  function approveUser()   { return Promise.reject('User admin moved to GAS — use TheVine.flock.users.approve()'); }
  function denyUser()      { return Promise.reject('User admin moved to GAS — use TheVine.flock.users.deny()'); }
  function resetPasscode() { return Promise.reject('User admin moved to GAS — use TheVine.flock.users.resetPasscode()'); }

  /* ══════════════════════════════════════════════════════════════════
     MEMBERS — churches/{churchId}/members
     ══════════════════════════════════════════════════════════════════ */

  function _membersRef() {
    return _churchRef().collection('members');
  }

  function listMembers(opts) {
    opts = opts || {};
    var q = _membersRef().orderBy('lastName');
    if (opts.membershipStatus) q = q.where('membershipStatus', '==', opts.membershipStatus);
    return _paginatedGet(q, opts);
  }


  function countMembers() {
    return _membersRef().get().then(function(snap) { return snap.size; });
  }
  function getMember(idOrEmail) {
    // Try by doc ID first, fall back to email query
    return _membersRef().doc(idOrEmail).get().then(function(doc) {
      if (doc.exists) { var d = doc.data(); d.id = doc.id; return d; }
      // Fall back: query by primaryEmail
      return _membersRef().where('primaryEmail', '==', idOrEmail.toLowerCase())
        .limit(1).get().then(function(snap) {
          if (snap.empty) return null;
          var d2 = snap.docs[0].data(); d2.id = snap.docs[0].id; return d2;
        });
    });
  }

  function _genMemberPin() {
    // 9 random digits always starting with 1–9, formatted xxx-xx-xxxx
    var n = String(Math.floor(Math.random() * 900000000) + 100000000);
    return n.slice(0, 3) + '-' + n.slice(3, 5) + '-' + n.slice(5);
  }

  function createMember(data) {
    data.primaryEmail = (data.primaryEmail || data.email || '').toLowerCase();
    if (!data.memberPin) data.memberPin = _genMemberPin();
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = _userEmail;
    return _membersRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateMember(data) {
    var id = data.id;
    if (!id) return Promise.reject('member id required');
    var payload = Object.assign({}, data);
    delete payload.id;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _membersRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  function deleteMember(id) {
    return _membersRef().doc(id).delete();
  }

  /* ── CASCADE DELETE — wipe all user data across every collection ── */
  function deleteUserCascade(email) {
    if (!email) return Promise.reject('email required');
    email = email.toLowerCase();

    var toDelete = [];   // { ref, label }
    var toUpdate = [];   // { ref, data, label }

    function _collect(ref, label) {
      toDelete.push({ ref: ref, label: label });
    }

    function _sweep(collRef, field, value, label) {
      return collRef.where(field, '==', value).get().then(function(snap) {
        snap.forEach(function(doc) { _collect(doc.ref, label); });
      });
    }

    function _sweepConvo(field) {
      return _convosRef().where(field, 'array-contains', email).get().then(function(snap) {
        snap.forEach(function(doc) {
          var d = doc.data();
          var arr = d[field] || [];
          if (arr.length <= 1) {
            _collect(doc.ref, 'conversations');
          } else {
            var upd = {};
            upd[field] = firebase.firestore.FieldValue.arrayRemove(email);
            if (field === 'subscribers') upd.subscriberCount = firebase.firestore.FieldValue.increment(-1);
            else upd.memberCount = firebase.firestore.FieldValue.increment(-1);
            toUpdate.push({ ref: doc.ref, data: upd, label: 'conversations (removed from)' });
          }
        });
      });
    }

    // Step 1 — find member doc(s) by email
    return _membersRef().where('primaryEmail', '==', email).limit(5).get()
      .then(function(snap) {
        var memberIds = [];
        snap.forEach(function(doc) {
          memberIds.push(doc.id);
          _collect(doc.ref, 'members');
        });

        // Build unique lookup keys: email + any Firestore member doc IDs
        var ids = [email];
        memberIds.forEach(function(mid) { if (mid !== email && ids.indexOf(mid) === -1) ids.push(mid); });

        var s = [];

        // ── Direct doc-keyed by email ──
        s.push(_permissionsRef().doc(email).get().then(function(d) { if (d.exists) _collect(d.ref, 'permissions'); }));
        s.push(_accessRef().doc(email).get().then(function(d) { if (d.exists) _collect(d.ref, 'accessControl'); }));
        var prefId = email.replace(/[^a-zA-Z0-9@._-]/g, '_');
        s.push(_prefsRef().doc(prefId).get().then(function(d) { if (d.exists) _collect(d.ref, 'preferences'); }));

        // ── Email-field queries ──
        s.push(_sweep(_memberCardsRef(), 'email', email, 'memberCards'));
        s.push(_sweep(_prayersRef(), 'submitterEmail', email, 'prayers'));
        s.push(_sweep(_journalRef(), 'createdBy', email, 'journal'));
        s.push(_sweep(_todosRef(), 'assignedTo', email, 'todos'));
        s.push(_sweep(_notifsRef(), 'recipientEmail', email, 'notifications'));
        s.push(_sweep(_calendarEventsRef(), 'email', email, 'calendarEvents'));
        s.push(_sweep(_outreachContactsRef(), 'email', email, 'outreachContacts'));
        s.push(_sweep(_outreachContactsRef(), 'assignedTo', email, 'outreachContacts'));

        // ── memberId-based queries (email OR Firestore doc ID) ──
        ids.forEach(function(mid) {
          s.push(_sweep(_rsvpsRef(), 'memberId', mid, 'rsvps'));
          s.push(_sweep(_volunteersRef(), 'memberId', mid, 'volunteers'));
          s.push(_sweep(_givingRef(), 'memberId', mid, 'giving'));
          s.push(_sweep(_pledgesRef(), 'memberId', mid, 'pledges'));
          s.push(_sweep(_contactsRef(), 'memberId', mid, 'contactLog'));
          s.push(_sweep(_notesRef(), 'memberId', mid, 'pastoralNotes'));
          s.push(_sweep(_milestonesRef(), 'memberId', mid, 'milestones'));
          s.push(_sweep(_careCasesRef(), 'memberId', mid, 'careCases'));
          s.push(_sweep(_careAssignmentsRef(), 'memberId', mid, 'careAssignments'));
          s.push(_sweep(_compassionRef(), 'memberId', mid, 'compassionRequests'));
          s.push(_sweep(_discEnrollRef(), 'memberId', mid, 'discEnrollments'));
          s.push(_sweep(_discGoalsRef(), 'memberId', mid, 'discGoals'));
          s.push(_sweep(_discAssessRef(), 'memberId', mid, 'discAssessments'));
          s.push(_sweep(_discMilestonesRef(), 'memberId', mid, 'discMilestones'));
          s.push(_sweep(_discCertsRef(), 'memberId', mid, 'discCertificates'));
          s.push(_sweep(_discMentoringRef(), 'mentorId', mid, 'discMentoring'));
          s.push(_sweep(_discMentoringRef(), 'menteeId', mid, 'discMentoring'));
          s.push(_sweep(_lrnProgressRef(), 'memberId', mid, 'lrnProgress'));
          s.push(_sweep(_lrnNotesRef(), 'memberId', mid, 'lrnNotes'));
          s.push(_sweep(_lrnCertsRef(), 'memberId', mid, 'lrnCertificates'));
          s.push(_sweep(_lrnRecsRef(), 'memberId', mid, 'lrnRecommendations'));
          s.push(_sweep(_lrnQuizResultsRef(), 'memberId', mid, 'lrnQuizResults'));
        });

        // ── Conversations: remove user from participant / subscriber arrays ──
        s.push(_sweepConvo('participants'));
        s.push(_sweepConvo('subscribers'));

        // ── Group member subcollections: groups/{gid}/members/{memberId} ──
        s.push(_groupsRef().get().then(function(gSnap) {
          var gDels = [];
          gSnap.forEach(function(gDoc) {
            ids.forEach(function(mid) {
              gDels.push(
                _groupsRef().doc(gDoc.id).collection('members').doc(mid).get().then(function(mDoc) {
                  if (mDoc.exists) _collect(mDoc.ref, 'groupMembers');
                })
              );
            });
          });
          return Promise.all(gDels);
        }));

        return Promise.all(s);
      })
      .then(function() {
        // ── Batch-delete all collected refs (max 450 ops per batch) ──
        var allOps = toDelete.map(function(o) { return { type: 'delete', ref: o.ref, label: o.label }; })
          .concat(toUpdate.map(function(o) { return { type: 'update', ref: o.ref, data: o.data, label: o.label }; }));

        if (allOps.length === 0) return Promise.resolve();

        var promises = [];
        for (var i = 0; i < allOps.length; i += 450) {
          var chunk = allOps.slice(i, i + 450);
          var b = _db.batch();
          chunk.forEach(function(op) {
            if (op.type === 'delete') b.delete(op.ref);
            else b.update(op.ref, op.data);
          });
          promises.push(b.commit());
        }
        return Promise.all(promises);
      })
      .then(function() {
        var summary = {};
        toDelete.forEach(function(o) { summary[o.label] = (summary[o.label] || 0) + 1; });
        toUpdate.forEach(function(o) { summary[o.label] = (summary[o.label] || 0) + 1; });
        return { success: true, totalDeleted: toDelete.length, totalUpdated: toUpdate.length, summary: summary };
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     MEMBER CARDS — churches/{churchId}/memberCards
     ══════════════════════════════════════════════════════════════════ */

  function _memberCardsRef() {
    return _churchRef().collection('memberCards');
  }

  function listMemberCards(opts) {
    opts = opts || {};
    var q = _memberCardsRef().orderBy('lastName');
    if (opts.status) q = q.where('status', '==', opts.status);
    if (opts.visibility) q = q.where('visibility', '==', opts.visibility);
    return _paginatedGet(q, opts);
  }

  function getMemberCard(idOrNumber) {
    return _memberCardsRef().doc(idOrNumber).get().then(function(doc) {
      if (doc.exists) { var d = doc.data(); d.id = doc.id; return d; }
      // Fall back: query by memberNumber
      return _memberCardsRef().where('memberNumber', '==', idOrNumber)
        .limit(1).get().then(function(snap) {
          if (snap.empty) return null;
          var d2 = snap.docs[0].data(); d2.id = snap.docs[0].id; return d2;
        });
    });
  }

  function searchMemberCards(query) {
    var q = (query || '').toLowerCase();
    if (!q) return listMemberCards({ limit: 200 });
    // Fast path: when the query looks like an email address, resolve it with a
    // single targeted index lookup instead of fetching up to 200 docs client-side.
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q)) {
      return _memberCardsRef().where('email', '==', q).limit(1).get()
        .then(function(snap) {
          var results = [];
          snap.forEach(function(doc) { var d = doc.data(); d.id = doc.id; results.push(d); });
          return results;
        });
    }
    // Client-side filter for name/title searches
    return listMemberCards({ limit: 200 }).then(function(cards) {
      return cards.filter(function(c) {
        return (c.firstName || '').toLowerCase().indexOf(q) >= 0 ||
               (c.lastName || '').toLowerCase().indexOf(q) >= 0 ||
               (c.email || '').toLowerCase().indexOf(q) >= 0 ||
               (c.cardTitle || '').toLowerCase().indexOf(q) >= 0;
      });
    });
  }

  function createMemberCard(data) {
    data.email = (data.email || '').toLowerCase();
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = _userEmail;
    return _memberCardsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateMemberCard(data) {
    var id = data.id;
    if (!id) return Promise.reject('card id required');
    var payload = Object.assign({}, data);
    delete payload.id;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _memberCardsRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  function deleteMemberCard(id) {
    return _memberCardsRef().doc(id).delete();
  }

  /* ══════════════════════════════════════════════════════════════════
     PERMISSIONS — churches/{churchId}/permissions
     ══════════════════════════════════════════════════════════════════ */

  function _permissionsRef() {
    return _churchRef().collection('permissions');
  }

  function getPermissions(email) {
    return _permissionsRef().doc(email.toLowerCase()).get().then(function(doc) {
      if (!doc.exists) return { overrides: [], permissions: {} };
      return doc.data();
    });
  }

  function listPermissionModules() {
    // Static config — stored as a single doc; cache for the session to avoid
    // a redundant read on every profile open (this doc changes very rarely).
    if (_permModulesCache) return Promise.resolve(_permModulesCache);
    return _churchRef().collection('settings').doc('permissionModules').get()
      .then(function(doc) {
        _permModulesCache = doc.exists ? doc.data() : { modules: {} };
        return _permModulesCache;
      });
  }

  function setPermissions(email, grants, denies) {
    var payload = {
      targetEmail: email.toLowerCase(),
      grants: grants || [],
      denies: denies || [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _userEmail
    };
    return _permissionsRef().doc(email.toLowerCase()).set(payload, { merge: true });
  }

  /* ── Member-role layer (memberId-keyed access role) ────────────── */
  // Lightweight role-per-member mapping used by the_fold's "Access Level"
  // dropdown.  Stored alongside permissions but keyed by memberId so it
  // survives email changes.  Granular grants/denies still live in the
  // email-keyed permissions doc above.
  function _memberRolesRef() { return _churchRef().collection('memberRoles'); }

  function getMemberRole(p) {
    var memberId = (p && typeof p === 'object') ? (p.memberId || p.id) : p;
    if (!memberId) return Promise.resolve(null);
    return _memberRolesRef().doc(String(memberId)).get().then(function(doc) {
      if (!doc.exists) return null;
      var d = doc.data(); d.id = doc.id; return d;
    });
  }

  function setMemberRole(p) {
    p = p || {};
    var memberId = p.memberId || p.id;
    if (!memberId) return Promise.reject('memberId required');
    var role = p.role || p.accessRole || p.level || '';
    var payload = {
      memberId: String(memberId),
      role:     role,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _userEmail
    };
    return _memberRolesRef().doc(String(memberId)).set(payload, { merge: true });
  }

  /* ══════════════════════════════════════════════════════════════════
     CARE CASES — churches/{churchId}/careCases
     ══════════════════════════════════════════════════════════════════ */

  function _careCasesRef() {
    return _churchRef().collection('careCases');
  }

  function listCareCases(opts) {
    opts = opts || {};
    var q = _careCasesRef().orderBy('createdAt', 'desc');
    if (opts.status) q = q.where('status', '==', opts.status);
    return _paginatedGet(q, opts, function(d) { return Object.assign({ id: d.id }, d.data()); });
  }

  function getCareCase(id) {
    return _careCasesRef().doc(id).get().then(function(doc) {
      if (!doc.exists) return null;
      return Object.assign({ id: doc.id }, doc.data());
    });
  }

  function createCareCase(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    data.status = data.status || 'Open';
    return _careCasesRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateCareCase(data) {
    var id = data.id || data.caseId;
    if (!id) return Promise.reject('case id required');
    var payload = Object.assign({}, data);
    delete payload.id; delete payload.caseId;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _careCasesRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  function resolveCareCase(opts) {
    var id = (typeof opts === 'string') ? opts : (opts.id || opts.caseId);
    return _careCasesRef().doc(id).update({
      status: 'Resolved',
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      resolvedBy: _userEmail,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function() {
      return { ok: true, row: { status: 'Resolved' } };
    });
  }

  function careDashboard() {
    return _careCasesRef().get().then(function(snap) {
      var cases = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      var open = 0, resolved = 0, total = cases.length;
      cases.forEach(function(c) { if (c.status === 'Resolved') resolved++; else open++; });
      return { open: open, resolved: resolved, total: total, cases: cases };
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     CARE INTERACTIONS — churches/{churchId}/careInteractions
     ══════════════════════════════════════════════════════════════════ */

  function _careInteractionsRef() {
    return _churchRef().collection('careInteractions');
  }

  function listCareInteractions(opts) {
    opts = opts || {};
    var q = _careInteractionsRef().orderBy('createdAt', 'desc');
    if (opts.caseId) q = q.where('caseId', '==', opts.caseId);
    q = q.limit(opts.limit || 100);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  function createCareInteraction(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    return _careInteractionsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function followUpDoneCareInteraction(id) {
    return _careInteractionsRef().doc(id).update({
      followUpDone: true,
      followUpCompletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _userEmail
    });
  }

  function careFollowUpsDue() {
    return _careInteractionsRef()
      .where('followUpDone', '==', false)
      .where('dueDate', '<=', new Date().toISOString().slice(0, 10))
      .orderBy('dueDate')
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     CARE ASSIGNMENTS — churches/{churchId}/careAssignments
     ══════════════════════════════════════════════════════════════════ */

  function _careAssignmentsRef() {
    return _churchRef().collection('careAssignments');
  }

  function listCareAssignments(opts) {
    opts = opts || {};
    var q = _careAssignmentsRef().orderBy('createdAt', 'desc').limit(opts.limit || 80);
    if (opts.status) q = q.where('status', '==', opts.status);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  function careAssignmentsForMember(memberId) {
    return _careAssignmentsRef().where('memberId', '==', memberId).get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  function careAssignmentsMyFlock(caregiverId) {
    return _careAssignmentsRef()
      .where('caregiverId', '==', caregiverId)
      .where('status', '==', 'Active')
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function createCareAssignment(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    data.status = data.status || 'Active';
    return _careAssignmentsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function reassignCareAssignment(data) {
    var id = data.id;
    if (!id) return Promise.reject('assignment id required');
    return _careAssignmentsRef().doc(id).update({
      caregiverId: data.newCaregiverId,
      notes: data.notes || '',
      reassignedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _userEmail
    });
  }

  function endCareAssignment(id) {
    if (typeof id === 'object') id = id.id;
    return _careAssignmentsRef().doc(id).update({
      status: 'Ended',
      endedAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedBy: _userEmail
    });
  }

  function listCaregivers() {
    return _careAssignmentsRef()
      .where('status', '==', 'Active')
      .get().then(function(snap) {
        var seen = {}, list = [];
        snap.docs.forEach(function(d) {
          var a = d.data();
          if (a.caregiverId && !seen[a.caregiverId]) {
            seen[a.caregiverId] = true;
            list.push({ email: a.caregiverId, role: a.role || 'Shepherd' });
          }
        });
        return list;
      });
  }

  /* ══════════════════════════════════════════════════════════════════
     COMPASSION REQUESTS — churches/{churchId}/compassionRequests
     ══════════════════════════════════════════════════════════════════ */

  function _compassionRef() {
    return _churchRef().collection('compassionRequests');
  }

  function listCompassionRequests(opts) {
    opts = opts || {};
    var q = _compassionRef().orderBy('createdAt', 'desc');
    if (opts.status) q = q.where('status', '==', opts.status);
    return _paginatedGet(q, opts, function(d) { return Object.assign({ id: d.id }, d.data()); });
  }


  function countOpenCompassionRequests() {
    return _compassionRef()
      .where('status', 'not-in', ['closed','completed','resolved','archived'])
      .get().then(function(snap) { return snap.size; });
  }
  function getCompassionRequest(id) {
    return _compassionRef().doc(id).get().then(function(doc) {
      if (!doc.exists) return null;
      return Object.assign({ id: doc.id }, doc.data());
    });
  }

  function createCompassionRequest(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    data.status = data.status || 'Pending';
    return _compassionRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateCompassionRequest(data) {
    var id = data.id;
    if (!id) return Promise.reject('request id required');
    var payload = Object.assign({}, data);
    delete payload.id;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _compassionRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  function approveCompassionRequest(id) {
    if (typeof id === 'object') id = id.id;
    return _compassionRef().doc(id).update({
      status: 'Approved',
      approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      approvedBy: _userEmail,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function denyCompassionRequest(id) {
    if (typeof id === 'object') id = id.id;
    return _compassionRef().doc(id).update({
      status: 'Denied',
      deniedAt: firebase.firestore.FieldValue.serverTimestamp(),
      deniedBy: _userEmail,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function resolveCompassionRequest(id) {
    if (typeof id === 'object') id = id.id;
    return _compassionRef().doc(id).update({
      status: 'Resolved',
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      resolvedBy: _userEmail,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function compassionDashboard() {
    return _compassionRef().get().then(function(snap) {
      var reqs = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      var pending = 0, approved = 0, resolved = 0;
      reqs.forEach(function(r) {
        if (r.status === 'Pending') pending++;
        else if (r.status === 'Approved') approved++;
        else if (r.status === 'Resolved') resolved++;
      });
      return { pending: pending, approved: approved, resolved: resolved, total: reqs.length, requests: reqs };
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     COMPASSION LOGS — churches/{churchId}/compassionLogs
     ══════════════════════════════════════════════════════════════════ */

  function _compassionLogRef() {
    return _churchRef().collection('compassionLogs');
  }

  function listCompassionLogs(opts) {
    opts = opts || {};
    var q = _compassionLogRef().orderBy('createdAt', 'desc');
    if (opts.requestId) q = q.where('requestId', '==', opts.requestId);
    q = q.limit(opts.limit || 80);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  function recentCompassionLogs(opts) {
    opts = opts || {};
    return _compassionLogRef().orderBy('createdAt', 'desc').limit(opts.limit || 10)
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.ass