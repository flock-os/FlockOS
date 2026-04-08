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

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function _now()    { return firebase.firestore.FieldValue.serverTimestamp(); }
  function _ts(d)    { return d && d.toDate ? d.toDate() : (d ? new Date(d) : new Date()); }
  function _uid()    { return _db.collection('_').doc().id; }

  function _churchRef() {
    return _db.collection('churches').doc(_churchId);
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
    if (_initialized) return Promise.resolve();
    _initialized = true;

    // Accept optional config override
    if (config) FIREBASE_CONFIG = config;

    // Firebase SDK must be loaded
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.warn('[UpperRoom] Firebase SDK not loaded');
      _initialized = false;
      return Promise.reject(new Error('Firebase SDK not available'));
    }

    // Initialize Firebase app (idempotent)
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    _db   = firebase.firestore();
    _auth = firebase.auth();

    // Enable offline persistence (only runs once)
    _db.enablePersistence({ synchronizeTabs: true }).catch(function(err) {
      if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
        console.warn('[UpperRoom] Persistence error:', err.code);
      }
    });

    return Promise.resolve();
  }

  /* ── Authenticate via Custom Token from Apps Script ────────────── */
  function authenticate() {
    // Get session from FlockOS auth
    var session = null;
    if (typeof Nehemiah !== 'undefined' && Nehemiah.getSession) {
      session = Nehemiah.getSession();
    } else if (typeof TheVine !== 'undefined' && TheVine.session) {
      session = TheVine.session();
    }
    if (!session || !session.email) {
      return Promise.reject(new Error('No FlockOS session'));
    }

    _userEmail = session.email;
    _userName  = session.displayName || session.email;

    // Determine churchId from page context
    _churchId = _resolveChurchId();

    // Already signed in?
    if (_auth.currentUser) {
      _ready = true;
      return Promise.resolve();
    }

    // Request a Firebase Custom Token from Apps Script
    return TheVine.flock.firebase.token()
      .then(function(res) {
        var token = res && (res.token || res.customToken);
        if (!token) throw new Error('No custom token returned');
        return _auth.signInWithCustomToken(token);
      })
      .then(function() {
        _ready = true;
      });
  }

  /* ── Resolve churchId from page/config ────────────────────────── */
  function _resolveChurchId() {
    // Try manifest short_name
    try {
      var meta = document.querySelector('meta[name="church-id"]');
      if (meta) return meta.content;
    } catch (_) {}
    // Try URL path: /Church/TheForest/ → TheForest
    var m = window.location.pathname.match(/\/Church\/([^/]+)\//);
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

    // Batch: write message + update conversation metadata + mark unread for others
    var batch = _db.batch();
    batch.set(msgRef, msgData);
    batch.update(convoRef, {
      lastMessageAt: _now(),
      lastSnippet:   snippet,
      lastSenderName: _userName
    });
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
    return _churchRef().collection('settings').doc('app')
      .get()
      .then(function(doc) {
        if (!doc.exists) return 'firebase';
        return doc.data().commsMode || 'firebase';
      })
      .catch(function() { return 'firebase'; });
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
    var q = _prayersRef().orderBy('submittedAt', 'desc').limit(opts.limit || 300);
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        d.id = doc.id;
        results.push(d);
      });
      return results;
    });
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
    return _prayersRef().doc(id).set({
      submitterName:     data.submitterName || 'Anonymous',
      submitterEmail:    data.submitterEmail || _userEmail,
      submitterPhone:    data.submitterPhone || '',
      prayerText:        data.prayerText || '',
      category:          data.category || '',
      status:            'New',
      isConfidential:    data.isConfidential || 'FALSE',
      followUpRequested: data.followUpRequested || 'FALSE',
      assignedTo:        '',
      adminNotes:        '',
      createdBy:         _userEmail,
      submittedAt:       _now(),
      lastUpdated:       _now(),
      updatedBy:         _userEmail
    }).then(function() { return id; });
  }

  function updatePrayer(id, data) {
    data.lastUpdated = _now();
    data.updatedBy   = _userEmail;
    return _prayersRef().doc(id).update(data);
  }

  function deletePrayer(id) {
    return _prayersRef().doc(id).delete();
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
    var q = _todosRef().orderBy('createdAt', 'desc').limit(opts.limit || 200);
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data();
        d.id = doc.id;
        results.push(d);
      });
      return results;
    });
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

  function listUsers(opts) {
    opts = opts || {};
    var q = _usersRef().orderBy('lastName').limit(opts.limit || 500);
    if (opts.status) q = q.where('status', '==', opts.status);
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data(); d.id = doc.id; results.push(d);
      });
      return results;
    });
  }

  function getUser(email) {
    return _usersRef().doc(email.toLowerCase()).get().then(function(doc) {
      if (!doc.exists) return null;
      var d = doc.data(); d.id = doc.id; return d;
    });
  }

  function createUser(data) {
    var email = (data.email || '').toLowerCase();
    if (!email) return Promise.reject('email required');
    data.email = email;
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = _userEmail;
    return _usersRef().doc(email).set(data).then(function() {
      data.id = email; return data;
    });
  }

  function updateUser(data) {
    var email = (data.targetEmail || data.email || '').toLowerCase();
    if (!email) return Promise.reject('email required');
    var payload = Object.assign({}, data);
    delete payload.targetEmail;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _usersRef().doc(email).update(payload).then(function() {
      return payload;
    });
  }

  function approveUser(email) {
    return _usersRef().doc(email.toLowerCase()).update({
      status: 'active',
      approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      approvedBy: _userEmail
    });
  }

  function denyUser(email) {
    return _usersRef().doc(email.toLowerCase()).update({
      status: 'denied',
      deniedAt: firebase.firestore.FieldValue.serverTimestamp(),
      deniedBy: _userEmail
    });
  }

  function resetPasscode(email, newPasscode) {
    return _usersRef().doc(email.toLowerCase()).update({
      passcode: newPasscode,
      passcodeResetAt: firebase.firestore.FieldValue.serverTimestamp(),
      passcodeResetBy: _userEmail
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     MEMBERS — churches/{churchId}/members
     ══════════════════════════════════════════════════════════════════ */

  function _membersRef() {
    return _churchRef().collection('members');
  }

  function listMembers(opts) {
    opts = opts || {};
    var q = _membersRef().orderBy('lastName').limit(opts.limit || 500);
    if (opts.membershipStatus) q = q.where('membershipStatus', '==', opts.membershipStatus);
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data(); d.id = doc.id; results.push(d);
      });
      return results;
    });
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

  function createMember(data) {
    data.primaryEmail = (data.primaryEmail || data.email || '').toLowerCase();
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

  /* ══════════════════════════════════════════════════════════════════
     MEMBER CARDS — churches/{churchId}/memberCards
     ══════════════════════════════════════════════════════════════════ */

  function _memberCardsRef() {
    return _churchRef().collection('memberCards');
  }

  function listMemberCards(opts) {
    opts = opts || {};
    var q = _memberCardsRef().orderBy('lastName').limit(opts.limit || 500);
    if (opts.status) q = q.where('status', '==', opts.status);
    if (opts.visibility) q = q.where('visibility', '==', opts.visibility);
    return q.get().then(function(snap) {
      var results = [];
      snap.forEach(function(doc) {
        var d = doc.data(); d.id = doc.id; results.push(d);
      });
      return results;
    });
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
    // Client-side filter — Firestore doesn't support LIKE queries
    return listMemberCards({ limit: 500 }).then(function(cards) {
      var q = (query || '').toLowerCase();
      if (!q) return cards;
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
    // Static config — stored as a single doc
    return _churchRef().collection('settings').doc('permissionModules').get()
      .then(function(doc) {
        if (!doc.exists) return { modules: {} };
        return doc.data();
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

  /* ══════════════════════════════════════════════════════════════════
     CARE CASES — churches/{churchId}/careCases
     ══════════════════════════════════════════════════════════════════ */

  function _careCasesRef() {
    return _churchRef().collection('careCases');
  }

  function listCareCases(opts) {
    opts = opts || {};
    var q = _careCasesRef().orderBy('createdAt', 'desc').limit(opts.limit || 200);
    if (opts.status) q = q.where('status', '==', opts.status);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
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
    var q = _compassionRef().orderBy('createdAt', 'desc').limit(opts.limit || 200);
    if (opts.status) q = q.where('status', '==', opts.status);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
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
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function createCompassionLog(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    return _compassionLogRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function deleteCompassionLog(id) {
    if (typeof id === 'object') id = id.id;
    return _compassionLogRef().doc(id).delete();
  }

  /* ══════════════════════════════════════════════════════════════════
     COMPASSION RESOURCES — churches/{churchId}/compassionResources
     ══════════════════════════════════════════════════════════════════ */

  function _compassionResourcesRef() {
    return _churchRef().collection('compassionResources');
  }

  function listCompassionResources(opts) {
    opts = opts || {};
    return _compassionResourcesRef().orderBy('name').limit(opts.limit || 80)
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function lowCompassionResources() {
    return _compassionResourcesRef().where('status', '==', 'Low')
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function createCompassionResource(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    return _compassionResourcesRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateCompassionResource(data) {
    var id = data.id;
    if (!id) return Promise.reject('resource id required');
    var payload = Object.assign({}, data);
    delete payload.id;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _compassionResourcesRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     OUTREACH CONTACTS — churches/{churchId}/outreachContacts
     ══════════════════════════════════════════════════════════════════ */

  function _outreachContactsRef() {
    return _churchRef().collection('outreachContacts');
  }

  function listOutreachContacts(opts) {
    opts = opts || {};
    var q = _outreachContactsRef().orderBy('createdAt', 'desc').limit(opts.limit || 200);
    if (opts.status) q = q.where('status', '==', opts.status);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  function getOutreachContact(id) {
    if (typeof id === 'object') id = id.contactId || id.id;
    return _outreachContactsRef().doc(id).get().then(function(doc) {
      if (!doc.exists) return null;
      return Object.assign({ id: doc.id }, doc.data());
    });
  }

  function createOutreachContact(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    data.status = data.status || 'New';
    return _outreachContactsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateOutreachContact(data) {
    var id = data.id;
    if (!id) return Promise.reject('contact id required');
    var payload = Object.assign({}, data);
    delete payload.id;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _outreachContactsRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  function convertOutreachContact(data) {
    var id = data.id;
    if (!id) return Promise.reject('contact id required');
    return _outreachContactsRef().doc(id).update({
      status: 'Converted',
      memberId: data.memberId || '',
      convertedAt: firebase.firestore.FieldValue.serverTimestamp(),
      convertedBy: _userEmail,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  function submitOutreachContact(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.status = data.status || 'New';
    data.source = data.source || 'PublicForm';
    return _outreachContactsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     OUTREACH CAMPAIGNS — churches/{churchId}/outreachCampaigns
     ══════════════════════════════════════════════════════════════════ */

  function _outreachCampaignsRef() {
    return _churchRef().collection('outreachCampaigns');
  }

  function listOutreachCampaigns(opts) {
    opts = opts || {};
    return _outreachCampaignsRef().orderBy('createdAt', 'desc').limit(opts.limit || 50)
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function createOutreachCampaign(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    data.status = data.status || 'Active';
    return _outreachCampaignsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function updateOutreachCampaign(data) {
    var id = data.id;
    if (!id) return Promise.reject('campaign id required');
    var payload = Object.assign({}, data);
    delete payload.id;
    payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    payload.updatedBy = _userEmail;
    return _outreachCampaignsRef().doc(id).update(payload).then(function() {
      payload.id = id; return payload;
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     OUTREACH FOLLOW-UPS — churches/{churchId}/outreachFollowUps
     ══════════════════════════════════════════════════════════════════ */

  function _outreachFollowUpsRef() {
    return _churchRef().collection('outreachFollowUps');
  }

  function listOutreachFollowUps(opts) {
    opts = opts || {};
    var q = _outreachFollowUpsRef().orderBy('createdAt', 'desc');
    if (opts.contactId) q = q.where('contactId', '==', opts.contactId);
    q = q.limit(opts.limit || 60);
    return q.get().then(function(snap) {
      return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
    });
  }

  function createOutreachFollowUp(data) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    data.createdBy = data.createdBy || _userEmail;
    return _outreachFollowUpsRef().add(data).then(function(ref) {
      data.id = ref.id; return data;
    });
  }

  function outreachFollowUpDone(id) {
    if (typeof id === 'object') id = id.id;
    return _outreachFollowUpsRef().doc(id).update({
      done: true,
      completedAt: firebase.firestore.FieldValue.serverTimestamp(),
      completedBy: _userEmail
    });
  }

  function outreachFollowUpsDue() {
    return _outreachFollowUpsRef()
      .where('done', '==', false)
      .where('dueDate', '<=', new Date().toISOString().slice(0, 10))
      .orderBy('dueDate')
      .get().then(function(snap) {
        return snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });
  }

  function outreachDashboard() {
    return _outreachContactsRef().get().then(function(snap) {
      var contacts = snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      var newC = 0, active = 0, converted = 0;
      contacts.forEach(function(c) {
        if (c.status === 'New') newC++;
        else if (c.status === 'Converted') converted++;
        else active++;
      });
      return { new: newC, active: active, converted: converted, total: contacts.length, contacts: contacts };
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     PUBLIC API — window.UpperRoom
     ══════════════════════════════════════════════════════════════════ */

  window.UpperRoom = {
    // Lifecycle
    init:           init,
    authenticate:   authenticate,
    signOut:        signOut,
    detachAll:      detachAll,

    // State
    isReady:        function() { return _ready; },
    churchId:       function() { return _churchId; },
    userEmail:      function() { return _userEmail; },

    // Conversations
    createDM:           createDM,
    createRoom:         createRoom,
    createThread:       createThread,
    createChannel:      createChannel,
    listConversations:  listConversations,
    listSentConversations: listSentConversations,
    listenConversations: listenConversations,
    getConversation:    getConversation,
    updateConversation: updateConversation,
    archiveConversation: archiveConversation,
    deleteConversation: deleteConversation,
    browseRooms:        browseRooms,
    browseChannels:     browseChannels,
    subscribeChannel:   subscribeChannel,
    unsubscribeChannel: unsubscribeChannel,
    postToChannel:      postToChannel,

    // Templates
    listTemplates:   listTemplates,
    getTemplate:     getTemplate,
    createTemplate:  createTemplate,
    updateTemplate:  updateTemplate,
    deleteTemplate:  deleteTemplate,

    // Broadcasts
    listBroadcasts:  listBroadcasts,
    createBroadcast: createBroadcast,

    // Notification Preferences
    getNotifPrefs:    getNotifPrefs,
    updateNotifPrefs: updateNotifPrefs,

    // Prayer Requests
    listPrayers:    listPrayers,
    getPrayer:      getPrayer,
    createPrayer:   createPrayer,
    updatePrayer:   updatePrayer,
    deletePrayer:   deletePrayer,
    listenPrayers:  listenPrayers,

    // Todos / Tasks
    listTodos:      listTodos,
    myTodos:        myTodos,
    createTodo:     createTodo,
    updateTodo:     updateTodo,
    completeTodo:   completeTodo,
    archiveTodo:    archiveTodo,
    unarchiveTodo:  unarchiveTodo,
    deleteTodo:     deleteTodo,
    listenTodos:    listenTodos,

    // Settings
    getCommsMode:       getCommsMode,
    setCommsMode:       setCommsMode,

    // Membership
    joinRoom:       joinRoom,
    leaveRoom:      leaveRoom,
    addParticipant: addParticipant,

    // Messages
    sendMessage:    sendMessage,
    getMessages:    getMessages,
    listenMessages: listenMessages,
    deleteMessage:  deleteMessage,

    // Notifications
    createNotification:  createNotification,
    listenNotifications: listenNotifications,
    markNotifRead:       markNotifRead,
    markAllNotifsRead:   markAllNotifsRead,
    getUnreadCount:      getUnreadCount,

    // Typing
    setTyping:      setTyping,
    listenTyping:   listenTyping,

    // Users
    listUsers:       listUsers,
    getUser:         getUser,
    createUser:      createUser,
    updateUser:      updateUser,
    approveUser:     approveUser,
    denyUser:        denyUser,
    resetPasscode:   resetPasscode,

    // Members
    listMembers:     listMembers,
    getMember:       getMember,
    createMember:    createMember,
    updateMember:    updateMember,
    deleteMember:    deleteMember,

    // Member Cards
    listMemberCards:   listMemberCards,
    getMemberCard:     getMemberCard,
    searchMemberCards: searchMemberCards,
    createMemberCard:  createMemberCard,
    updateMemberCard:  updateMemberCard,
    deleteMemberCard:  deleteMemberCard,

    // Permissions
    getPermissions:        getPermissions,
    listPermissionModules: listPermissionModules,
    setPermissions:        setPermissions,

    // Care Cases
    listCareCases:         listCareCases,
    getCareCase:           getCareCase,
    createCareCase:        createCareCase,
    updateCareCase:        updateCareCase,
    resolveCareCase:       resolveCareCase,
    careDashboard:         careDashboard,

    // Care Interactions
    listCareInteractions:       listCareInteractions,
    createCareInteraction:      createCareInteraction,
    followUpDoneCareInteraction: followUpDoneCareInteraction,
    careFollowUpsDue:           careFollowUpsDue,

    // Care Assignments
    listCareAssignments:       listCareAssignments,
    careAssignmentsForMember:  careAssignmentsForMember,
    careAssignmentsMyFlock:    careAssignmentsMyFlock,
    createCareAssignment:      createCareAssignment,
    reassignCareAssignment:    reassignCareAssignment,
    endCareAssignment:         endCareAssignment,
    listCaregivers:            listCaregivers,

    // Compassion Requests
    listCompassionRequests:    listCompassionRequests,
    getCompassionRequest:      getCompassionRequest,
    createCompassionRequest:   createCompassionRequest,
    updateCompassionRequest:   updateCompassionRequest,
    approveCompassionRequest:  approveCompassionRequest,
    denyCompassionRequest:     denyCompassionRequest,
    resolveCompassionRequest:  resolveCompassionRequest,
    compassionDashboard:       compassionDashboard,

    // Compassion Logs
    listCompassionLogs:        listCompassionLogs,
    recentCompassionLogs:      recentCompassionLogs,
    createCompassionLog:       createCompassionLog,
    deleteCompassionLog:       deleteCompassionLog,

    // Compassion Resources
    listCompassionResources:   listCompassionResources,
    lowCompassionResources:    lowCompassionResources,
    createCompassionResource:  createCompassionResource,
    updateCompassionResource:  updateCompassionResource,

    // Outreach Contacts
    listOutreachContacts:      listOutreachContacts,
    getOutreachContact:        getOutreachContact,
    createOutreachContact:     createOutreachContact,
    updateOutreachContact:     updateOutreachContact,
    convertOutreachContact:    convertOutreachContact,
    submitOutreachContact:     submitOutreachContact,

    // Outreach Campaigns
    listOutreachCampaigns:     listOutreachCampaigns,
    createOutreachCampaign:    createOutreachCampaign,
    updateOutreachCampaign:    updateOutreachCampaign,

    // Outreach Follow-ups
    listOutreachFollowUps:     listOutreachFollowUps,
    createOutreachFollowUp:    createOutreachFollowUp,
    outreachFollowUpDone:      outreachFollowUpDone,
    outreachFollowUpsDue:      outreachFollowUpsDue,
    outreachDashboard:         outreachDashboard,

    // Utility
    timeAgo:        _timeAgo
  };

})();
