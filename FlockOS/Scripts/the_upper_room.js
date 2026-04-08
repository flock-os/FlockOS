/* ═══════════════════════════════════════════════════════════════════════
   THE UPPER ROOM — Firebase Firestore Comms Module for FlockOS
   Real-time messaging: DMs, Chat Rooms, Channels, Notifications
   ═══════════════════════════════════════════════════════════════════════ */
;(function() {
  'use strict';

  /* ── Firebase Config ──────────────────────────────────────────────── */
  // Firebase API keys are public identifiers (not secrets).
  // Security is enforced by Firestore security rules, not key secrecy.
  var FIREBASE_CONFIG = {
    apiKey:            'AIzaSyBA-fkxjABbwIHn0i6MPiXbGwahfJmuJeo',
    authDomain:        'flockos-notify.firebaseapp.com',
    projectId:         'flockos-notify',
    storageBucket:     'flockos-notify.firebasestorage.app',
    messagingSenderId: '321766738616',
    appId:             '1:321766738616:web:d2c1c53ad7493fcde4c24d'
  };

  /* ── State ────────────────────────────────────────────────────────── */
  var _db         = null;   // Firestore instance
  var _auth       = null;   // Firebase Auth instance
  var _churchId   = null;   // e.g. 'FlockOS', 'TheForest'
  var _userEmail  = null;   // logged-in user email
  var _userName   = null;   // logged-in display name
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
    if (_ready) return Promise.resolve();

    // Accept optional config override
    if (config) FIREBASE_CONFIG = config;

    // Firebase SDK must be loaded
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      console.warn('[UpperRoom] Firebase SDK not loaded');
      return Promise.reject(new Error('Firebase SDK not available'));
    }

    // Initialize Firebase app (idempotent)
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    _db   = firebase.firestore();
    _auth = firebase.auth();

    // Enable offline persistence
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
      .where('status', '!=', 'archived')
      .orderBy('status')
      .orderBy('lastMessageAt', 'desc')
      .limit(50)
      .get()
      .then(function(snap) {
        var rooms = [];
        snap.forEach(function(doc) {
          var d = doc.data();
          d.id = doc.id;
          rooms.push(d);
        });
        return rooms;
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
    browseRooms:        browseRooms,

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

    // Utility
    timeAgo:        _timeAgo
  };

})();
