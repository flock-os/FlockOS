/* ══════════════════════════════════════════════════════════════════════════════
   THE WORD — FlockChat Engine
   "In the beginning was the Word, and the Word was with God,
    and the Word was God." — John 1:1

   Responsibilities:
     • Auth (Firebase email/password — standalone test mode)
     • Channel CRUD + real-time list
     • Message stream (Firestore onSnapshot, cursor pagination)
     • Message send / edit / delete / react
     • DM thread management
     • Presence (RTDB onDisconnect)
     • Typing indicators (RTDB ephemeral)
     • Unread badge counts
     • @mention highlight
     • Emoji picker (client-side)
     • Channel seeding (#general, #announcements, #prayer-chain)
   ══════════════════════════════════════════════════════════════════════════════ */

'use strict';

// ── Wait for _FC to be ready (set by FlockChat.html inline module) ──────────
(function waitForFC() {
  if (!window._FC) { setTimeout(waitForFC, 50); return; }
  TheWord.init();
})();

const TheWord = (() => {

  // ── Firebase handles ───────────────────────────────────────────────────
  let auth, db, rtdb, F; // F = firebase function imports

  // ── State ──────────────────────────────────────────────────────────────
  let _me          = null;   // { uid, displayName, email, role }
  let _activeId    = null;   // channelId or dmId
  let _activeType  = null;   // 'channel' | 'dm'
  let _channels    = [];
  let _dms         = [];
  let _msgUnsub    = null;   // unsubscribe for current message listener
  let _chUnsub     = null;   // unsubscribe for channel list
  let _dmUnsub     = null;
  let _typingTimer = null;
  let _isTyping    = false;
  let _lastMsgTs   = null;   // for pagination cursor
  let _detailsOpen = false;
  let _authMode    = 'signin'; // 'signin' | 'register'
  let _emojiTarget = null;   // message id for reaction target (null = composer)

  // ── Emoji set ──────────────────────────────────────────────────────────
  const EMOJIS = [
    '👍','❤️','😂','🙏','🔥','✅','🎉','👏',
    '😊','😢','😮','🤔','💪','✨','🙌','💬',
    '📖','⛪','🕊️','🌿','☀️','🌙','⚡','🎶'
  ];

  // ── Default channels seeded on first run ───────────────────────────────
  const SEED_CHANNELS = [
    { name: 'general',       description: 'General conversation for the whole team', type: 'public' },
    { name: 'announcements', description: 'Important updates from leadership',       type: 'public' },
    { name: 'prayer-chain',  description: 'Share prayer requests and praise reports',type: 'public' }
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────
  function init() {
    ({ auth, db, rtdb } = window._FC);
    F = window._FC.firebase;

    _buildEmojiPicker();
    _bindAuthUI();
    _bindComposer();
    _bindModals();
    _bindSidebar();
    _bindTopbar();

    // Auth state observer
    F.onAuthStateChanged(auth, async (user) => {
      if (user) {
        await _onSignedIn(user);
      } else {
        _onSignedOut();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────────────────────────────────
  function _bindAuthUI() {
    const submitBtn    = _el('auth-submit-btn');
    const emailInput   = _el('auth-email');
    const passInput    = _el('auth-pass');
    const nameInput    = _el('auth-name');
    const toggleLink   = _el('auth-toggle-link');
    const toggleText   = _el('auth-toggle-text');
    const subtitle     = _el('auth-subtitle');
    const nameField    = _el('auth-name-field');

    submitBtn.addEventListener('click', _handleAuthSubmit);
    [emailInput, passInput, nameInput].forEach(el => {
      el.addEventListener('keydown', e => { if (e.key === 'Enter') _handleAuthSubmit(); });
    });

    toggleLink.addEventListener('click', () => {
      _authMode = _authMode === 'signin' ? 'register' : 'signin';
      if (_authMode === 'register') {
        submitBtn.textContent    = 'Create Account';
        subtitle.textContent     = 'Create your workspace account';
        toggleText.textContent   = 'Already have one?';
        toggleLink.textContent   = 'Sign in';
        nameField.style.display  = 'block';
      } else {
        submitBtn.textContent    = 'Sign In';
        subtitle.textContent     = 'Sign in to your workspace';
        toggleText.textContent   = 'No account?';
        toggleLink.textContent   = 'Create one';
        nameField.style.display  = 'none';
      }
      _clearAuthError();
    });
  }

  async function _handleAuthSubmit() {
    const email = _el('auth-email').value.trim();
    const pass  = _el('auth-pass').value;
    const name  = _el('auth-name').value.trim();
    const btn   = _el('auth-submit-btn');

    _clearAuthError();
    if (!email || !pass) { _showAuthError('Email and password are required.'); return; }

    btn.disabled = true;
    btn.textContent = _authMode === 'signin' ? 'Signing in…' : 'Creating account…';

    try {
      if (_authMode === 'register') {
        if (!name) { _showAuthError('Display name is required.'); return; }
        const cred = await F.createUserWithEmailAndPassword(auth, email, pass);
        await F.updateProfile(cred.user, { displayName: name });
        // Create user doc in Firestore
        await F.setDoc(F.doc(db, 'users', cred.user.uid), {
          displayName: name,
          email:       email,
          role:        'volunteer',
          avatar:      '',
          status:      'available',
          lastSeen:    F.serverTimestamp(),
          createdAt:   F.serverTimestamp()
        });
      } else {
        await F.signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (err) {
      _showAuthError(_friendlyAuthError(err.code));
      btn.disabled = false;
      btn.textContent = _authMode === 'signin' ? 'Sign In' : 'Create Account';
    }
  }

  function _friendlyAuthError(code) {
    const map = {
      'auth/invalid-credential':       'Incorrect email or password.',
      'auth/user-not-found':           'No account found for that email.',
      'auth/wrong-password':           'Incorrect password.',
      'auth/email-already-in-use':     'An account with that email already exists.',
      'auth/weak-password':            'Password must be at least 6 characters.',
      'auth/invalid-email':            'Please enter a valid email address.',
      'auth/too-many-requests':        'Too many attempts. Please wait and try again.',
      'auth/network-request-failed':   'Network error. Check your connection.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  }

  function _showAuthError(msg) {
    const el = _el('auth-error');
    el.textContent = msg;
    el.style.display = 'block';
  }

  function _clearAuthError() {
    const el = _el('auth-error');
    el.textContent = '';
    el.style.display = 'none';
  }

  async function _onSignedIn(user) {
    // Ensure user doc exists (in case they signed in before registering via this UI)
    const userRef  = F.doc(db, 'users', user.uid);
    const userSnap = await F.getDoc(userRef);
    if (!userSnap.exists()) {
      await F.setDoc(userRef, {
        displayName: user.displayName || user.email.split('@')[0],
        email:       user.email,
        role:        'volunteer',
        avatar:      '',
        status:      'available',
        lastSeen:    F.serverTimestamp(),
        createdAt:   F.serverTimestamp()
      });
    }

    _me = {
      uid:         user.uid,
      displayName: user.displayName || userSnap.data()?.displayName || user.email.split('@')[0],
      email:       user.email,
      role:        userSnap.data()?.role || 'volunteer'
    };

    // Update lastSeen
    await F.updateDoc(userRef, { lastSeen: F.serverTimestamp() });

    // Presence
    _initPresence();

    // Seed default channels (no-op if they already exist)
    await _seedChannels();

    // Boot UI
    _showApp();
    _startChannelListener();
    _startDMListener();
  }

  function _onSignedOut() {
    _me         = null;
    _activeId   = null;
    _activeType = null;
    if (_msgUnsub) { _msgUnsub(); _msgUnsub = null; }
    if (_chUnsub)  { _chUnsub();  _chUnsub  = null; }
    if (_dmUnsub)  { _dmUnsub();  _dmUnsub  = null; }
    _hideApp();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRESENCE
  // ─────────────────────────────────────────────────────────────────────────
  function _initPresence() {
    if (!_me) return;
    const presRef = F.ref(rtdb, `/presence/${_me.uid}`);

    // Mark online when connected
    const connRef = F.ref(rtdb, '.info/connected');
    F.onValue(connRef, (snap) => {
      if (!snap.val()) return;
      F.onDisconnect(presRef).set({ state: 'offline', lastChanged: F.rtdbTs() });
      F.set(presRef, { state: 'online', lastChanged: F.rtdbTs() });
    });
  }

  function _watchPresence(userId, dotEl) {
    const presRef = F.ref(rtdb, `/presence/${userId}`);
    F.onValue(presRef, (snap) => {
      const data  = snap.val();
      const state = data?.state || 'offline';
      dotEl.className = 'dm-presence ' + state;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHANNEL SEEDING
  // ─────────────────────────────────────────────────────────────────────────
  async function _seedChannels() {
    const colRef = F.collection(db, 'channels');
    const snap   = await F.getDocs(F.query(colRef, F.limit(1)));
    if (!snap.empty) return; // already seeded

    for (const ch of SEED_CHANNELS) {
      await F.addDoc(colRef, {
        name:        ch.name,
        description: ch.description,
        type:        ch.type,
        createdBy:   _me.uid,
        createdAt:   F.serverTimestamp(),
        members:     [_me.uid],
        messageCount: 0
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHANNEL LIST LISTENER
  // ─────────────────────────────────────────────────────────────────────────
  function _startChannelListener() {
    const q = F.query(
      F.collection(db, 'channels'),
      F.orderBy('name')
    );
    _chUnsub = F.onSnapshot(q, (snap) => {
      _channels = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      _renderChannelList();
    });
  }

  function _renderChannelList() {
    const container = _el('channel-list');
    const search    = _el('sidebar-search').value.toLowerCase();
    container.innerHTML = '';

    _channels
      .filter(ch => !search || ch.name.toLowerCase().includes(search))
      .forEach(ch => {
        const item = document.createElement('div');
        item.className = 'sidebar-item' + (_activeId === ch.id ? ' active' : '');
        item.dataset.id = ch.id;
        item.innerHTML = `
          <span class="sigil">${ch.type === 'private' ? '🔒' : '#'}</span>
          <span class="ch-name">${_esc(ch.name)}</span>
          <span class="unread-badge" id="badge-${ch.id}"></span>`;
        item.addEventListener('click', () => _openChannel(ch));
        container.appendChild(item);
      });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DM LIST LISTENER
  // ─────────────────────────────────────────────────────────────────────────
  function _startDMListener() {
    if (!_me) return;
    const q = F.query(
      F.collection(db, 'dms'),
      F.where('members', 'array-contains', _me.uid),
      F.orderBy('lastTimestamp', 'desc')
    );
    _dmUnsub = F.onSnapshot(q, async (snap) => {
      _dms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      await _renderDMList();
    });
  }

  async function _renderDMList() {
    const container = _el('dm-list');
    const search    = _el('sidebar-search').value.toLowerCase();
    container.innerHTML = '';

    for (const dm of _dms) {
      const otherId   = dm.members.find(id => id !== _me.uid);
      if (!otherId) continue;

      let otherName = dm.otherName || otherId;
      try {
        const uSnap = await F.getDoc(F.doc(db, 'users', otherId));
        if (uSnap.exists()) otherName = uSnap.data().displayName || otherName;
      } catch (_) { /* offline */ }

      if (search && !otherName.toLowerCase().includes(search)) continue;

      const item = document.createElement('div');
      item.className = 'sidebar-item' + (_activeId === dm.id ? ' active' : '');
      item.dataset.id = dm.id;

      const dot = document.createElement('div');
      dot.className = 'dm-presence';
      _watchPresence(otherId, dot);

      item.innerHTML = `<span class="ch-name">${_esc(otherName)}</span>
        <span class="unread-badge" id="badge-${dm.id}"></span>`;
      item.insertBefore(dot, item.firstChild);
      item.addEventListener('click', () => _openDM(dm, otherName));
      container.appendChild(item);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OPEN CHANNEL
  // ─────────────────────────────────────────────────────────────────────────
  function _openChannel(ch) {
    _setActive(ch.id, 'channel');
    _el('topbar-channel-name').innerHTML =
      `<span class="sigil">${ch.type === 'private' ? '🔒' : '#'}</span><span id="topbar-channel-label">${_esc(ch.name)}</span>`;
    _el('topbar-channel-desc').textContent = ch.description || '';
    _el('composer-input').placeholder = `Message #${ch.name}…`;
    _el('details-title').textContent = `# ${ch.name}`;
    _el('details-desc').textContent  = ch.description || 'No description.';
    _renderDetails(ch);
    _listenMessages('channels', ch.id);
    _renderChannelList();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OPEN DM
  // ─────────────────────────────────────────────────────────────────────────
  function _openDM(dm, otherName) {
    _setActive(dm.id, 'dm');
    _el('topbar-channel-name').innerHTML = `<span id="topbar-channel-label">${_esc(otherName)}</span>`;
    _el('topbar-channel-desc').textContent = 'Direct Message';
    _el('composer-input').placeholder = `Message ${otherName}…`;
    _el('details-title').textContent = otherName;
    _el('details-desc').textContent  = 'Direct Message';
    _listenMessages('dms', dm.id);
    _renderDMList();
  }

  function _setActive(id, type) {
    _activeId   = id;
    _activeType = type;
    _el('no-channel').style.display   = 'none';
    _el('thread-pane').style.display  = 'flex';
    _el('thread-pane').style.flexDirection = 'column';
    _el('message-list').innerHTML     = '<div style="text-align:center;padding:24px"><div class="spinner"></div></div>';
    if (_msgUnsub) { _msgUnsub(); _msgUnsub = null; }
    _lastMsgTs = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MESSAGE LISTENER
  // ─────────────────────────────────────────────────────────────────────────
  function _listenMessages(collection, parentId) {
    const msgCol = F.collection(db, collection, parentId, 'messages');
    const q = F.query(msgCol, F.orderBy('timestamp', 'asc'), F.limit(60));

    _msgUnsub = F.onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      _renderMessages(msgs);
    });

    // Typing indicator
    const typRef = F.ref(rtdb, `/typing/${parentId}`);
    F.onValue(typRef, (snap) => {
      const data = snap.val() || {};
      const others = Object.entries(data)
        .filter(([uid, val]) => uid !== _me?.uid && val === true)
        .map(([uid]) => uid);
      _renderTyping(others);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER MESSAGES
  // ─────────────────────────────────────────────────────────────────────────
  function _renderMessages(msgs) {
    const list = _el('message-list');
    const wasAtBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 80;

    list.innerHTML = '';
    let lastDate = null;
    let lastAuthor = null;
    let lastTs = null;

    if (msgs.length === 0) {
      list.innerHTML = `<div class="empty-thread">
        <div class="icon">✉️</div>
        <h3>No messages yet</h3>
        <p>Be the first to say something!</p>
      </div>`;
      return;
    }

    msgs.forEach(msg => {
      const ts       = msg.timestamp?.toDate?.() || new Date();
      const dateStr  = ts.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
      const grouped  = lastAuthor === msg.authorId
                       && lastTs && (ts - lastTs < 5 * 60 * 1000);

      if (dateStr !== lastDate) {
        const div = document.createElement('div');
        div.className = 'day-divider';
        div.innerHTML = `<div class="line"></div><div class="label">${_esc(dateStr)}</div><div class="line"></div>`;
        list.appendChild(div);
        lastDate = dateStr;
      }

      const row = document.createElement('div');
      row.className = 'msg-row' + (grouped ? ' grouped' : '');
      row.dataset.msgId = msg.id;

      const initials = _initials(msg.authorName || '?');
      const timeStr  = ts.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
      const reactions = _renderReactionChips(msg.reactions || {}, msg.id);
      const canEdit   = msg.authorId === _me?.uid && !msg.deletedAt;
      const text      = msg.deletedAt
        ? '<em style="color:var(--ink-faint)">This message was deleted.</em>'
        : _formatText(msg.text || '');

      row.innerHTML = `
        <div class="msg-avatar">${_esc(initials)}</div>
        <div class="msg-body">
          <div class="msg-meta">
            <span class="msg-author">${_esc(msg.authorName || 'Unknown')}</span>
            <span class="msg-time">${timeStr}</span>
          </div>
          <div class="msg-text">${text}${msg.editedAt ? '<span class="msg-edited">(edited)</span>' : ''}</div>
          ${reactions}
        </div>
        ${!msg.deletedAt ? `<div class="msg-actions">
          <button class="msg-action-btn" title="React" data-action="react" data-id="${msg.id}">😊</button>
          ${canEdit ? `<button class="msg-action-btn" title="Edit"   data-action="edit"   data-id="${msg.id}">✏️</button>` : ''}
          ${canEdit ? `<button class="msg-action-btn" title="Delete" data-action="delete" data-id="${msg.id}">🗑️</button>` : ''}
        </div>` : ''}`;

      // Wire reaction chips
      row.querySelectorAll('.reaction-chip').forEach(chip => {
        chip.addEventListener('click', () => _toggleReaction(msg.id, chip.dataset.emoji));
      });
      // Wire action buttons
      row.querySelectorAll('.msg-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const { action, id } = btn.dataset;
          if (action === 'react')   _showEmojiPicker(e, id);
          if (action === 'edit')    _editMessage(msg);
          if (action === 'delete')  _deleteMessage(msg.id);
        });
      });

      list.appendChild(row);
      lastAuthor = msg.authorId;
      lastTs     = ts;
    });

    if (wasAtBottom || msgs.length <= 3) {
      list.scrollTop = list.scrollHeight;
    }
  }

  function _renderReactionChips(reactions, msgId) {
    const entries = Object.entries(reactions);
    if (!entries.length) return '';
    const chips = entries.map(([emoji, uids]) => {
      const reacted = uids.includes(_me?.uid);
      return `<div class="reaction-chip${reacted ? ' reacted' : ''}" data-emoji="${emoji}">
        <span class="emoji">${emoji}</span>
        <span class="count">${uids.length}</span>
      </div>`;
    }).join('');
    return `<div class="msg-reactions">${chips}</div>`;
  }

  function _formatText(text) {
    // Escape HTML, then apply mention/link formatting
    let t = _esc(text);
    t = t.replace(/@(\w[\w.]*)/g, (_, name) => {
      const isSelf = name.toLowerCase() === (_me?.displayName || '').toLowerCase();
      return `<span class="mention${isSelf ? ' self' : ''}">@${_esc(name)}</span>`;
    });
    return t;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TYPING INDICATOR
  // ─────────────────────────────────────────────────────────────────────────
  function _renderTyping(uids) {
    const el = _el('typing-indicator');
    if (!uids.length) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>
      <span style="margin-left:6px">${uids.length === 1 ? 'Someone is' : `${uids.length} people are`} typing…</span>`;
  }

  function _setTyping(active) {
    if (!_activeId || !_me) return;
    const typRef = F.ref(rtdb, `/typing/${_activeId}/${_me.uid}`);
    F.set(typRef, active ? true : null);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEND / EDIT / DELETE / REACT
  // ─────────────────────────────────────────────────────────────────────────
  function _bindComposer() {
    const input   = _el('composer-input');
    const sendBtn = _el('send-btn');

    input.addEventListener('input', () => {
      // Auto-resize
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';

      sendBtn.disabled = !input.value.trim();

      // Typing indicator
      if (!_isTyping) { _isTyping = true; _setTyping(true); }
      clearTimeout(_typingTimer);
      _typingTimer = setTimeout(() => { _isTyping = false; _setTyping(false); }, 2000);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) _sendMessage();
      }
    });

    sendBtn.addEventListener('click', _sendMessage);
  }

  async function _sendMessage() {
    const input = _el('composer-input');
    const text  = input.value.trim();
    if (!text || !_activeId || !_me) return;

    const collPath = _activeType === 'channel' ? 'channels' : 'dms';
    const msgCol   = F.collection(db, collPath, _activeId, 'messages');

    input.value = '';
    input.style.height = 'auto';
    _el('send-btn').disabled = true;
    _setTyping(false);
    _isTyping = false;

    try {
      await F.addDoc(msgCol, {
        authorId:    _me.uid,
        authorName:  _me.displayName,
        text:        text,
        reactions:   {},
        editedAt:    null,
        deletedAt:   null,
        timestamp:   F.serverTimestamp()
      });
      // Update parent doc lastMessage
      await F.updateDoc(F.doc(db, collPath, _activeId), {
        lastMessage:   text.substring(0, 100),
        lastTimestamp: F.serverTimestamp()
      }).catch(() => {});
    } catch (err) {
      _toast('Failed to send message.', 'error');
      console.error(err);
    }
  }

  function _editMessage(msg) {
    const row   = document.querySelector(`[data-msg-id="${msg.id}"]`);
    if (!row) return;
    const textEl = row.querySelector('.msg-text');
    const orig   = msg.text;
    textEl.innerHTML = `<textarea style="
      width:100%;background:var(--bg);border:1px solid var(--accent);
      border-radius:6px;padding:6px 9px;color:var(--ink);font-size:0.88rem;
      resize:none;outline:none;font-family:inherit;line-height:1.5"
      rows="2">${_esc(orig)}</textarea>
      <div style="display:flex;gap:6px;margin-top:5px">
        <button class="btn-primary" style="font-size:0.78rem;padding:5px 12px" id="edit-save">Save</button>
        <button class="btn-secondary" style="font-size:0.78rem;padding:5px 12px" id="edit-cancel">Cancel</button>
      </div>`;
    const ta = textEl.querySelector('textarea');
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);

    textEl.querySelector('#edit-save').addEventListener('click', async () => {
      const newText = ta.value.trim();
      if (!newText) return;
      const collPath = _activeType === 'channel' ? 'channels' : 'dms';
      const msgRef   = F.doc(db, collPath, _activeId, 'messages', msg.id);
      await F.updateDoc(msgRef, { text: newText, editedAt: F.serverTimestamp() });
    });
    textEl.querySelector('#edit-cancel').addEventListener('click', () => {
      textEl.innerHTML = _formatText(orig);
    });
  }

  async function _deleteMessage(msgId) {
    if (!confirm('Delete this message?')) return;
    const collPath = _activeType === 'channel' ? 'channels' : 'dms';
    const msgRef   = F.doc(db, collPath, _activeId, 'messages', msgId);
    await F.updateDoc(msgRef, { deletedAt: F.serverTimestamp(), text: '' });
  }

  async function _toggleReaction(msgId, emoji) {
    if (!_me || !_activeId) return;
    const collPath = _activeType === 'channel' ? 'channels' : 'dms';
    const msgRef   = F.doc(db, collPath, _activeId, 'messages', msgId);
    const snap     = await F.getDoc(msgRef);
    if (!snap.exists()) return;

    const reactions = snap.data().reactions || {};
    const uids      = reactions[emoji] || [];
    const hasIt     = uids.includes(_me.uid);

    const updated = { ...reactions };
    if (hasIt) {
      updated[emoji] = uids.filter(u => u !== _me.uid);
      if (!updated[emoji].length) delete updated[emoji];
    } else {
      updated[emoji] = [...uids, _me.uid];
    }
    await F.updateDoc(msgRef, { reactions: updated });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMOJI PICKER
  // ─────────────────────────────────────────────────────────────────────────
  function _buildEmojiPicker() {
    const grid = _el('emoji-grid');
    EMOJIS.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'emoji-btn';
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        if (_emojiTarget) {
          _toggleReaction(_emojiTarget, emoji);
        } else {
          const input = _el('composer-input');
          input.value += emoji;
          input.dispatchEvent(new Event('input'));
          input.focus();
        }
        _closeEmojiPicker();
      });
      grid.appendChild(btn);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const picker = _el('emoji-picker');
      if (!picker.contains(e.target) && !e.target.closest('#btn-emoji') && !e.target.closest('[data-action="react"]')) {
        _closeEmojiPicker();
      }
    });

    _el('btn-emoji').addEventListener('click', (e) => {
      e.stopPropagation();
      _emojiTarget = null;
      _showEmojiPickerAt(e.currentTarget);
    });
  }

  function _showEmojiPicker(e, msgId) {
    e.stopPropagation();
    _emojiTarget = msgId;
    _showEmojiPickerAt(e.currentTarget);
  }

  function _showEmojiPickerAt(el) {
    const picker = _el('emoji-picker');
    const rect   = el.getBoundingClientRect();
    picker.style.display = 'block';
    picker.style.left    = Math.min(rect.left, window.innerWidth - 280) + 'px';
    picker.style.top     = (rect.bottom + 6) + 'px';
  }

  function _closeEmojiPicker() {
    _el('emoji-picker').style.display = 'none';
    _emojiTarget = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHANNEL CREATION MODAL
  // ─────────────────────────────────────────────────────────────────────────
  function _bindModals() {
    // New Channel
    _el('btn-new-channel').addEventListener('click', () => _openModal('modal-new-channel'));
    _el('btn-cancel-channel').addEventListener('click', () => _closeModal('modal-new-channel'));
    _el('btn-create-channel').addEventListener('click', _createChannel);

    // New DM
    _el('btn-new-dm').addEventListener('click', _openDMModal);
    _el('btn-cancel-dm').addEventListener('click', () => _closeModal('modal-new-dm'));
    _el('btn-open-dm').addEventListener('click', _startDM);

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) _closeModal(backdrop.id);
      });
    });
  }

  async function _createChannel() {
    const name = _el('new-ch-name').value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const desc = _el('new-ch-desc').value.trim();
    const type = _el('new-ch-type').value;

    if (!name) { _toast('Channel name is required.', 'error'); return; }

    const existing = _channels.find(c => c.name === name);
    if (existing) { _toast(`#${name} already exists.`, 'error'); return; }

    try {
      const ref = await F.addDoc(F.collection(db, 'channels'), {
        name, description: desc, type,
        createdBy: _me.uid,
        createdAt: F.serverTimestamp(),
        members: [_me.uid],
        messageCount: 0
      });
      _toast(`#${name} created!`, 'success');
      _closeModal('modal-new-channel');
      _el('new-ch-name').value = '';
      _el('new-ch-desc').value = '';
      // Open it immediately
      _openChannel({ id: ref.id, name, description: desc, type });
    } catch (err) {
      _toast('Failed to create channel.', 'error');
      console.error(err);
    }
  }

  async function _openDMModal() {
    const select = _el('dm-user-select');
    select.innerHTML = '<option value="">Loading…</option>';
    _openModal('modal-new-dm');

    try {
      const snap = await F.getDocs(F.collection(db, 'users'));
      select.innerHTML = '<option value="">— Select a person —</option>';
      snap.forEach(d => {
        if (d.id === _me.uid) return;
        const opt = document.createElement('option');
        opt.value       = d.id;
        opt.textContent = d.data().displayName || d.data().email;
        select.appendChild(opt);
      });
    } catch (err) {
      select.innerHTML = '<option value="">Error loading users</option>';
    }
  }

  async function _startDM() {
    const otherId = _el('dm-user-select').value;
    if (!otherId) { _toast('Select a person first.', 'error'); return; }

    // DM ID = sorted pair
    const dmId = [_me.uid, otherId].sort().join('_');
    const dmRef = F.doc(db, 'dms', dmId);
    const snap  = await F.getDoc(dmRef);

    const otherSnap = await F.getDoc(F.doc(db, 'users', otherId));
    const otherName = otherSnap.data()?.displayName || 'Unknown';

    if (!snap.exists()) {
      await F.setDoc(dmRef, {
        members:       [_me.uid, otherId],
        lastMessage:   '',
        lastTimestamp: F.serverTimestamp()
      });
    }

    _closeModal('modal-new-dm');
    _openDM({ id: dmId, members: [_me.uid, otherId] }, otherName);
  }

  function _openModal(id)  { _el(id).classList.add('open'); }
  function _closeModal(id) { _el(id).classList.remove('open'); }

  // ─────────────────────────────────────────────────────────────────────────
  // SIDEBAR SEARCH
  // ─────────────────────────────────────────────────────────────────────────
  function _bindSidebar() {
    _el('sidebar-search').addEventListener('input', () => {
      _renderChannelList();
      _renderDMList();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOPBAR CONTROLS
  // ─────────────────────────────────────────────────────────────────────────
  function _bindTopbar() {
    _el('btn-signout').addEventListener('click', async () => {
      await F.signOut(auth);
    });

    _el('btn-details-toggle').addEventListener('click', () => {
      _detailsOpen = !_detailsOpen;
      _el('details-pane').classList.toggle('collapsed', !_detailsOpen);
      _el('btn-details-toggle').classList.toggle('active', _detailsOpen);
    });

    _el('btn-details-close').addEventListener('click', () => {
      _detailsOpen = false;
      _el('details-pane').classList.add('collapsed');
      _el('btn-details-toggle').classList.remove('active');
    });
  }

  async function _renderDetails(ch) {
    const el = _el('details-members');
    el.innerHTML = '<div class="spinner" style="margin:12px auto"></div>';
    try {
      const members = ch.members || [];
      const rows = await Promise.all(members.map(async uid => {
        const snap = await F.getDoc(F.doc(db, 'users', uid));
        const data = snap.data() || {};
        const initials = _initials(data.displayName || uid);
        return `<div class="member-row">
          <div class="member-avatar">${_esc(initials)}</div>
          <span class="member-name">${_esc(data.displayName || uid)}</span>
          <span class="member-role">${_esc(data.role || 'volunteer')}</span>
        </div>`;
      }));
      el.innerHTML = rows.join('');
    } catch (_) {
      el.innerHTML = '<p style="font-size:0.8rem;color:var(--ink-faint)">Could not load members.</p>';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI TRANSITIONS
  // ─────────────────────────────────────────────────────────────────────────
  function _showApp() {
    _el('loading-overlay').style.display = 'none';
    _el('auth-screen').style.display     = 'none';
    _el('app').style.display             = 'flex';

    // Set topbar user info
    _el('topbar-uname').textContent = _me.displayName;
    const av = _el('topbar-avatar');
    av.textContent = _initials(_me.displayName);
  }

  function _hideApp() {
    _el('loading-overlay').style.display = 'none';
    _el('auth-screen').style.display     = 'flex';
    _el('app').style.display             = 'none';
    _el('thread-pane').style.display     = 'none';
    _el('no-channel').style.display      = 'flex';
    _el('channel-list').innerHTML        = '';
    _el('dm-list').innerHTML             = '';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOASTS
  // ─────────────────────────────────────────────────────────────────────────
  function _toast(msg, type = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    _el('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────────────
  function _el(id) { return document.getElementById(id); }

  function _esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _initials(name) {
    return (name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() || '')
      .join('');
  }

  // ─────────────────────────────────────────────────────────────────────────
  return { init };
})();
