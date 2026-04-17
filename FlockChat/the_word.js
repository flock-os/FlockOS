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
    _bindUserMenu();
    _bindAdminPanel();

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
    // Ensure user doc exists — wrapped in try/catch so a rules denial
    // doesn't block the whole app from loading.
    try {
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
      } else {
        await F.updateDoc(userRef, { lastSeen: F.serverTimestamp() }).catch(() => {});
      }

      _me = {
        uid:         user.uid,
        displayName: user.displayName || userSnap.data()?.displayName || user.email.split('@')[0],
        email:       user.email,
        role:        userSnap.data()?.role || 'volunteer'
      };
    } catch (err) {
      console.warn('Firestore user doc unavailable — continuing with auth identity only.', err);
      _me = {
        uid:         user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email:       user.email,
        role:        'volunteer'
      };
    }

    // Presence
    _initPresence();

    // Seed default channels (no-op if they already exist)
    await _seedChannels();

    // Boot UI
    _showApp();
    _loadUserReads();
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
      F.collection(db, 'channels')
    );
    _chUnsub = F.onSnapshot(q, (snap) => {
      _channels = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => a.name.localeCompare(b.name));
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
        const lastRead = _userReads[ch.id] || 0;
        const lastTs   = ch.lastTimestamp?.toMillis?.() || 0;
        const hasUnread = lastTs > lastRead && ch.id !== _activeId;
        const item = document.createElement('div');
        item.className = 'sidebar-item' + (_activeId === ch.id ? ' active' : '') + (hasUnread ? ' has-unread' : '');
        item.dataset.id = ch.id;
        item.innerHTML = `
          <span class="sigil">${ch.type === 'private' ? '🔒' : '#'}</span>
          <span class="ch-name">${_esc(ch.name)}</span>
          <span class="unread-badge" id="badge-${ch.id}">${hasUnread ? '●' : ''}</span>`;
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
      F.where('members', 'array-contains', _me.uid)
    );
    _dmUnsub = F.onSnapshot(q, async (snap) => {
      _dms = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.lastTimestamp?.toMillis?.() || 0) - (a.lastTimestamp?.toMillis?.() || 0));
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

      const lastRead  = _userReads[dm.id] || 0;
      const lastTs    = dm.lastTimestamp?.toMillis?.() || 0;
      const hasUnread = lastTs > lastRead && dm.id !== _activeId;
      item.className += hasUnread ? ' has-unread' : '';
      item.innerHTML = `<span class="ch-name">${_esc(otherName)}</span>
        <span class="unread-badge" id="badge-${dm.id}">${hasUnread ? '●' : ''}</span>`;
      item.insertBefore(dot, item.firstChild);
      item.addEventListener('click', () => _openDM(dm, otherName));
      container.appendChild(item);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OPEN CHANNEL
  // ─────────────────────────────────────────────────────────────────────────
  function _openChannel(ch) {
    const isMember = (ch.members || []).includes(_me?.uid);
    _setActive(ch.id, 'channel');
    _el('topbar-channel-name').innerHTML =
      `<span class="sigil">${ch.type === 'private' ? '🔒' : '#'}</span><span id="topbar-channel-label">${_esc(ch.name)}</span>`;
    _el('topbar-channel-desc').textContent = ch.description || '';
    _el('composer-input').placeholder = `Message #${ch.name}…`;
    _el('details-title').textContent = `# ${ch.name}`;
    _el('details-desc').textContent  = ch.description || 'No description.';
    _renderDetails(ch);

    // Show/hide join banner & composer
    const banner   = _el('join-banner');
    const composer = _el('composer');
    if (isMember) {
      banner.style.display   = 'none';
      composer.style.display = '';
      _el('btn-join-channel').onclick = null;
    } else {
      banner.style.display   = 'flex';
      composer.style.display = 'none';
      _el('btn-join-channel').onclick = () => _joinChannel(ch);
    }

    // Mark read
    _markRead(ch.id);
    _listenMessages('channels', ch.id);
    _renderChannelList();
    _closeSidebar();
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
    _el('join-banner').style.display   = 'none';
    _el('composer').style.display = '';
    _markRead(dm.id);
    _listenMessages('dms', dm.id);
    _renderDMList();
    _closeSidebar();
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
    const q = F.query(msgCol, F.limit(200));

    _msgUnsub = F.onSnapshot(q, (snap) => {
      const msgs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0));
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
    // Role gate: only admin or pastor may create channels
    if (!['admin', 'pastor'].includes(_me?.role)) {
      _toast('Only pastors and admins can create channels.', 'error');
      return;
    }

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
  // CHANNEL JOIN / LEAVE
  // ─────────────────────────────────────────────────────────────────────────
  async function _joinChannel(ch) {
    if (!_me) return;
    try {
      await F.updateDoc(F.doc(db, 'channels', ch.id), {
        members: F.arrayUnion(_me.uid)
      });
      _toast(`Joined #${ch.name}!`, 'success');
      _el('join-banner').style.display = 'none';
      _el('composer').style.display = '';
    } catch (err) {
      _toast('Could not join channel.', 'error');
      console.error(err);
    }
  }

  async function _leaveChannel(chId, chName) {
    if (!_me) return;
    if (!confirm(`Leave #${chName}?`)) return;
    try {
      await F.updateDoc(F.doc(db, 'channels', chId), {
        members: F.arrayRemove(_me.uid)
      });
      _toast(`Left #${chName}.`, 'success');
      if (_activeId === chId) {
        _activeId = null; _activeType = null;
        _el('thread-pane').style.display = 'none';
        _el('no-channel').style.display  = 'flex';
        if (_msgUnsub) { _msgUnsub(); _msgUnsub = null; }
      }
    } catch (err) {
      _toast('Could not leave channel.', 'error');
      console.error(err);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UNREAD TRACKING
  // ─────────────────────────────────────────────────────────────────────────
  function _markRead(id) {
    const now = Date.now();
    _userReads[id] = now;
    // Persist in Firestore (best-effort)
    if (_me) {
      F.setDoc(
        F.doc(db, 'userReads', _me.uid + '_' + id),
        { uid: _me.uid, targetId: id, lastRead: F.serverTimestamp() },
        { merge: true }
      ).catch(() => {});
    }
  }

  function _loadUserReads() {
    if (!_me) return;
    F.getDocs(F.query(
      F.collection(db, 'userReads'),
      F.where('uid', '==', _me.uid)
    )).then(snap => {
      snap.forEach(d => {
        const data = d.data();
        const ts = data.lastRead?.toMillis?.() || 0;
        _userReads[data.targetId] = ts;
      });
      _renderChannelList();
      _renderDMList();
    }).catch(() => {});
  }

  function _positionMenu(menu, anchorRect) {
    menu.style.display = 'block';
    menu.style.left = '0';
    menu.style.top  = '0';
    const menuW = menu.offsetWidth  || 200;
    const vw    = window.innerWidth;
    // Align right edge of menu to right edge of anchor, but clamp to viewport
    let left = anchorRect.right - menuW;
    left = Math.max(8, Math.min(left, vw - menuW - 8));
    menu.style.left = left + 'px';
    menu.style.top  = (anchorRect.bottom + 6) + 'px';
    menu.style.display = 'none'; // caller will show it
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER STATUS MENU
  // ─────────────────────────────────────────────────────────────────────────
  function _bindUserMenu() {
    const menu = _el('user-menu');

    // Toggle on avatar/name click
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('#topbar-user-pill');
      if (pill) {
        e.stopPropagation();
        if (menu.style.display === 'block') { menu.style.display = 'none'; return; }
        _positionMenu(menu, pill.getBoundingClientRect());
        menu.style.display = 'block';
        return;
      }
      if (!menu.contains(e.target)) menu.style.display = 'none';
    });

    // Status items
    menu.querySelectorAll('.user-menu-item[data-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        _setUserStatus(btn.dataset.status);
        menu.style.display = 'none';
      });
    });

    // Admin panel
    _el('btn-open-admin').addEventListener('click', () => {
      menu.style.display = 'none';
      _openAdminPanel();
    });

    // Sign out
    _el('btn-user-menu-signout').addEventListener('click', async () => {
      menu.style.display = 'none';
      await F.signOut(auth);
    });
  }

  async function _setUserStatus(status) {
    if (!_me) return;
    const stateMap = { available: 'online', away: 'away', dnd: 'dnd' };
    const presRef  = F.ref(rtdb, `/presence/${_me.uid}`);
    F.set(presRef, { state: stateMap[status] || 'online', lastChanged: F.rtdbTs() });
    await F.updateDoc(F.doc(db, 'users', _me.uid), { status }).catch(() => {});
    _me.status = status;
    const labels = { available: '🟢', away: '🟡', dnd: '🔴' };
    const dot = _el('topbar-status-dot');
    if (dot) dot.textContent = labels[status] || '🟢';
    _toast(`Status set to ${status}.`, 'success');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER ADMIN PANEL
  // ─────────────────────────────────────────────────────────────────────────
  function _bindAdminPanel() {
    _el('btn-close-admin').addEventListener('click', () => _closeModal('modal-admin'));
  }

  async function _openAdminPanel() {
    if (_me?.role !== 'admin') {
      _toast('Only admins can manage users.', 'error');
      return;
    }
    _openModal('modal-admin');
    const container = _el('admin-user-list');
    container.innerHTML = '<div class="spinner" style="margin:20px auto"></div>';

    try {
      const snap = await F.getDocs(F.collection(db, 'users'));
      container.innerHTML = '';
      snap.forEach(d => {
        const data = d.data();
        const uid  = d.id;
        const initials = _initials(data.displayName || uid);
        const isSelf = uid === _me.uid;

        const row = document.createElement('div');
        row.className = 'admin-row';
        row.innerHTML = `
          <div class="member-avatar">${_esc(initials)}</div>
          <div class="admin-info">
            <div class="admin-name">${_esc(data.displayName || uid)}${isSelf ? ' <em style="font-size:0.72rem;color:var(--ink-faint)">(you)</em>' : ''}</div>
            <div class="admin-email">${_esc(data.email || '')}</div>
          </div>
          <select id="role-sel-${uid}" ${isSelf ? 'disabled' : ''}>
            <option value="volunteer" ${data.role === 'volunteer' ? 'selected' : ''}>Volunteer</option>
            <option value="leader"    ${data.role === 'leader'    ? 'selected' : ''}>Leader</option>
            <option value="pastor"    ${data.role === 'pastor'    ? 'selected' : ''}>Pastor</option>
            <option value="admin"     ${data.role === 'admin'     ? 'selected' : ''}>Admin</option>
          </select>
          ${!isSelf ? `<button class="btn-remove" data-uid="${uid}">Remove</button>` : ''}`;

        const sel = row.querySelector(`#role-sel-${uid}`);
        if (sel) {
          sel.addEventListener('change', () => _setUserRole(uid, sel.value));
        }
        const removeBtn = row.querySelector('.btn-remove');
        if (removeBtn) {
          removeBtn.addEventListener('click', () => _removeUser(uid, data.displayName, row));
        }
        container.appendChild(row);
      });
      if (!snap.size) container.innerHTML = '<p style="color:var(--ink-muted);font-size:0.85rem">No users found.</p>';
    } catch (err) {
      container.innerHTML = '<p style="color:var(--danger)">Could not load users.</p>';
      console.error(err);
    }
  }

  async function _setUserRole(uid, role) {
    try {
      await F.updateDoc(F.doc(db, 'users', uid), { role });
      _toast('Role updated.', 'success');
    } catch (err) {
      _toast('Failed to update role.', 'error');
      console.error(err);
    }
  }

  async function _removeUser(uid, name, rowEl) {
    if (!confirm(`Remove ${name || uid} from the workspace? This cannot be undone.`)) return;
    try {
      await F.deleteDoc(F.doc(db, 'users', uid));
      rowEl.remove();
      _toast(`${name} removed.`, 'success');
    } catch (err) {
      _toast('Failed to remove user.', 'error');
      console.error(err);
    }
  }

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
    // Legacy sign-out button
    const oldSignout = _el('btn-signout');
    if (oldSignout) oldSignout.addEventListener('click', async () => { await F.signOut(auth); });

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

    // ── Mobile: hamburger + scrim + bottom nav ──
    const isMobile = () => window.innerWidth <= 640;

    // Show/hide bottom nav based on viewport (hamburger handled by CSS)
    function _applyMobileChrome() {
      _el('bottom-nav').style.display = isMobile() ? 'flex' : 'none';
    }
    _applyMobileChrome();
    window.addEventListener('resize', _applyMobileChrome);

    // Hamburger opens sidebar drawer
    _el('btn-sidebar-toggle').addEventListener('click', () => _toggleSidebar());

    // Scrim closes sidebar drawer
    _el('sidebar-scrim').addEventListener('click', () => _closeSidebar());

    // Bottom nav
    _el('btn-nav-channels').addEventListener('click', () => {
      _setSidebarTab('channels');
      _toggleSidebar(true);
    });
    _el('btn-nav-dms').addEventListener('click', () => {
      _setSidebarTab('dms');
      _toggleSidebar(true);
    });
    _el('btn-nav-me').addEventListener('click', () => {
      _closeSidebar();
      // Open user menu
      const pill = _el('topbar-user-pill');
      const menu = _el('user-menu');
      _positionMenu(menu, pill.getBoundingClientRect());
      menu.style.display = 'block';
    });
  }

  function _toggleSidebar(forceOpen) {
    const sidebar = _el('sidebar');
    const scrim   = _el('sidebar-scrim');
    const isOpen  = sidebar.classList.contains('open');
    if (forceOpen === true || !isOpen) {
      sidebar.classList.add('open');
      scrim.classList.add('open');
    } else {
      _closeSidebar();
    }
  }

  function _closeSidebar() {
    _el('sidebar').classList.remove('open');
    _el('sidebar-scrim').classList.remove('open');
  }

  function _setSidebarTab(tab) {
    // Scroll sidebar to channels or DMs section
    const target = tab === 'dms' ? _el('dm-list') : _el('channel-list');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update bottom nav active state
    _el('btn-nav-channels').classList.toggle('active', tab === 'channels');
    _el('btn-nav-dms').classList.toggle('active', tab === 'dms');
    _el('btn-nav-me').classList.remove('active');
  }

  async function _renderDetails(ch) {
    const el = _el('details-members');
    el.innerHTML = '<div class="spinner" style="margin:12px auto"></div>';

    // Show/hide Leave button based on membership
    const isMember = (ch.members || []).includes(_me?.uid);
    const leaveSection = _el('details-leave-section');
    const leaveBtn     = _el('btn-leave-channel');
    if (leaveSection) leaveSection.style.display = isMember ? 'block' : 'none';
    if (leaveBtn) leaveBtn.onclick = () => _leaveChannel(ch.id, ch.name);
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
    document.body.classList.remove('auth-open');

    // Set topbar user info
    _el('topbar-uname').textContent = (_me.displayName || '').split(' ')[0];
    const av = _el('topbar-avatar');
    av.textContent = _initials(_me.displayName);

    // Set user menu name
    const menuName = _el('user-menu-name');
    if (menuName) menuName.textContent = _me.displayName;

    // Role-gate channel creation button
    const btnNewCh = _el('btn-new-channel');
    if (btnNewCh) {
      btnNewCh.style.display = ['admin', 'pastor'].includes(_me?.role) ? '' : 'none';
    }
  }

  function _hideApp() {
    _el('loading-overlay').style.display = 'none';
    _el('auth-screen').style.display     = 'flex';
    _el('app').style.display             = 'none';
    _el('thread-pane').style.display     = 'none';
    _el('no-channel').style.display      = 'flex';
    _el('channel-list').innerHTML        = '';
    _el('dm-list').innerHTML             = '';
    document.body.classList.add('auth-open');
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

// ── Wait for _FC to be ready (set by FlockChat.html inline module) ──────────
(function waitForFC() {
  if (!window._FC) { setTimeout(waitForFC, 50); return; }
  TheWord.init();
})();
