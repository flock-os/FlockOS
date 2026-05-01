/* ══════════════════════════════════════════════════════════════════════════════
   THE GOSPEL · INVITATION — A Hope-Filled View of Jesus Christ
   "Come to me, all who labour and are heavy laden, and I will give you rest."
   — Matthew 11:28

   Three pillars of hope:
     1. The Great Invitations  — His personal calls of grace
     2. The "I AM" Declarations — His identity in John's Gospel
     3. The Finished Work       — The historical progression of redemption

   Share button: opens native share / SMS so friends receive the gospel link.
   ══════════════════════════════════════════════════════════════════════════════ */

export const name        = 'the_gospel_invitation';
export const title       = 'The Invitation';
export const description = 'Three pillars of hope — His invitations, His identity, and His finished work.';
export const icon        = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>`;
export const accent      = '#7eaacc';

/* ── Data ────────────────────────────────────────────────────────────────── */

const INVITATIONS = [
  {
    title:   'The Call to the Exhausted',
    quote:   'Come to me, all who labor and are heavy laden, and I will give you rest.',
    ref:     'Matthew 11:28',
    icon:    '🕊️',
    insight: 'Jesus does not demand more religious striving. He identifies the exhaustion of trying to earn worth and offers Himself as the antidote.',
  },
  {
    title:   'The Call to the Thirsty',
    quote:   'If anyone thirsts, let him come to me and drink.',
    ref:     'John 7:37–38',
    icon:    '💧',
    insight: 'Addressed to human dissatisfaction. Jesus promises a qualitative kind of life that provides an internal, eternal satisfaction.',
  },
  {
    title:   'The Call to Intimacy',
    quote:   'Behold, I stand at the door and knock.',
    ref:     'Revelation 3:20',
    icon:    '🚪',
    insight: 'A picture of divine pursuit. God does not force His way in; He knocks and offers friendship and reconciliation.',
  },
];

const IAM = [
  { label: 'Bread of Life',       need: 'Spiritual Hunger',      verse: 'John 6:35',  icon: '🍞', color: '#7eaacc', description: 'Just as physical bread sustains the body, Jesus is the essential nutrient for the soul. Without Him, the spirit starves; with Him, there is enduring life.' },
  { label: 'Light of the World',  need: 'Guidance in Darkness',  verse: 'John 8:12',  icon: '🕯️', color: '#8B7028', description: 'In a world of confusion, Jesus provides absolute clarity. Following Him guarantees you will walk in the light of life.' },
  { label: 'Door of the Sheep',   need: 'Security & Access',     verse: 'John 10:9',  icon: '🚪', color: '#7eaacc', description: 'Jesus is the singular entry point to safety. Through Him, one finds protection from spiritual predators and the freedom of abundant life.' },
  { label: 'Good Shepherd',       need: 'Care & Protection',     verse: 'John 10:11', icon: '🐑', color: '#3d8b4f', description: 'Unlike a hired hand, the Good Shepherd loves so profoundly that He willingly lays down His life for the vulnerable.' },
  { label: 'Resurrection & Life', need: 'Victory over Death',    verse: 'John 11:25', icon: '🌱', color: '#7e57c2', description: 'Faced with the terror of death, Jesus claims total authority. He is the resurrection; in Him, death is merely a doorway.' },
  { label: 'Way, Truth & Life',   need: 'Direction & Reality',   verse: 'John 14:6',  icon: '🧭', color: '#2563eb', description: 'The embodiment of ultimate reality and the source of all existence. All human searching ends in Him.' },
  { label: 'True Vine',           need: 'Purpose & Fruitfulness', verse: 'John 15:1', icon: '🍇', color: '#7eaacc', description: 'By abiding in Jesus, believers draw on His endless grace and strength to produce enduring fruit: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.' },
];

const WORK = [
  { title: 'The Incarnation', sub: 'God With Us',          summary: 'The Creator took on human flesh, experiencing our pains and limitations without sin.',                         hope: 'God knows exactly what it feels like to be human. You are deeply understood.' },
  { title: 'The Crucifixion', sub: 'The Atonement',        summary: 'On the cross, Jesus absorbed the debt of sin and guilt, declaring "It is finished."',                          hope: 'Your failures are paid for. There is no condemnation left for those who trust Him.' },
  { title: 'The Resurrection', sub: 'Victory Over Death',  summary: 'Three days later, Jesus rose, defeating the finality of death and inaugurating a new creation.',               hope: 'Death is not the end. The worst things are never the last things.' },
  { title: 'The Ascension',   sub: 'The Eternal Advocate', summary: 'Jesus ascended to the Father, where He currently reigns and intercedes for His people.',                       hope: 'You have a perfect representative in the highest court of reality.' },
];

/* ── Render ──────────────────────────────────────────────────────────────── */

export function render() {
  return /* html */`
    <style data-module="gi">
      /* ── Invitation cards ─────────────────────────────────────── */
      .gi-grid { display:grid; grid-template-columns:1fr; gap:16px; }
      @media(min-width:600px){ .gi-grid{ grid-template-columns:repeat(3,1fr); } }
      .gi-card {
        background:var(--bg-raised,#fff); border-radius:12px; padding:20px;
        border:1px solid var(--line,#e7e5e4); cursor:pointer;
        transition:border-color .25s, box-shadow .25s; text-align:left;
      }
      .gi-card:hover { border-color:#7eaacc; box-shadow:0 4px 14px rgba(0,0,0,.08); }
      .gi-card-icon  { font-size:2rem; margin-bottom:12px; }
      .gi-card h3    { font-size:1rem; font-weight:700; color:var(--ink,#1c1917); margin-bottom:8px; }
      .gi-card-quote { color:var(--ink-muted,#57534e); font-style:italic; font-size:.9rem; margin-bottom:6px; line-height:1.65; }
      .gi-card-ref   { font-size:.72rem; font-weight:700; color:var(--ink-faint,#a8a29e); text-transform:uppercase; letter-spacing:.06em; margin-bottom:12px; }
      .gi-card-insight { display:none; padding-top:12px; border-top:1px solid var(--line,#e7e5e4); font-size:.9rem; line-height:1.7; color:var(--ink-muted,#57534e); }
      .gi-card-insight.open { display:block; }
      .gi-insight-label { display:block; color:#7eaacc; font-weight:700; font-size:.68rem; text-transform:uppercase; letter-spacing:.14em; margin-bottom:4px; }
      .gi-toggle { text-align:center; color:var(--ink-faint,#a8a29e); font-size:1.25rem; margin-top:10px; transition:color .2s; user-select:none; }
      .gi-card:hover .gi-toggle { color:#7eaacc; }

      /* ── I AM section ────────────────────────────────────────── */
      .gi-iam-wrap { border:1px solid var(--line,#e7e5e4); border-radius:12px; overflow:hidden; }
      .gi-iam-grid { display:grid; grid-template-columns:1fr; }
      @media(min-width:700px){ .gi-iam-grid{ grid-template-columns:5fr 7fr; } }
      .gi-iam-sidebar {
        background:var(--bg-sunken,#fafaf9); padding:16px;
        display:flex; flex-direction:column; gap:3px;
      }
      @media(min-width:700px){
        .gi-iam-sidebar { border-right:1px solid var(--line,#e7e5e4); min-height:380px; justify-content:center; }
      }
      .gi-iam-nav {
        padding:10px 14px; cursor:pointer; border-radius:8px;
        font-size:.85rem; font-weight:500; color:var(--ink-muted,#78716c);
        border-left:3px solid transparent; transition:all .2s;
        display:flex; align-items:center; gap:10px;
      }
      .gi-iam-nav.active {
        background:rgba(126,170,204,.13); border-left-color:#7eaacc;
        color:var(--ink,#292524); font-weight:600;
      }
      .gi-iam-content { padding:24px; min-height:260px; display:flex; flex-direction:column; justify-content:center; }
      @media(min-width:700px){ .gi-iam-content{ padding:32px; } }
      .gi-iam-badge {
        display:inline-block; padding:3px 10px; border-radius:999px;
        border:1px solid var(--line,#e7e5e4); font-size:.68rem; font-weight:700;
        letter-spacing:.18em; text-transform:uppercase; color:#7eaacc; margin-bottom:16px;
      }
      .gi-iam-title  { font-size:1.75rem; font-weight:700; color:var(--ink,#1c1917); line-height:1.2; margin-bottom:16px; }
      @media(min-width:700px){ .gi-iam-title{ font-size:2.25rem; } }
      .gi-iam-meta   { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding-top:16px; border-top:1px solid var(--line,#e7e5e4); margin-bottom:16px; }
      .gi-iam-meta-label { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--ink-faint,#a8a29e); margin-bottom:4px; }
      .gi-iam-need   { font-size:1rem; color:var(--ink,#292524); font-style:italic; }
      .gi-iam-verse  { font-size:.875rem; color:#7eaacc; font-family:monospace; }
      .gi-iam-desc   { font-size:.9375rem; color:var(--ink-muted,#57534e); line-height:1.78; }

      /* ── Timeline ────────────────────────────────────────────── */
      .gi-tl-wrap { display:grid; grid-template-columns:1fr; gap:16px; }
      @media(min-width:600px){ .gi-tl-wrap{ grid-template-columns:5fr 7fr; } }
      .gi-tl-nav  { border-left:2px solid var(--line,#e7e5e4); }
      .gi-tl-item {
        padding:14px 18px; margin-left:-3px;
        border-left:4px solid transparent; cursor:pointer; transition:border-color .2s;
      }
      .gi-tl-item:hover  { border-left-color:var(--line,#d6d3d1); }
      .gi-tl-item.active { border-left-color:#7eaacc; }
      .gi-tl-item h4     { font-weight:700; font-size:.9875rem; color:var(--ink-faint,#a8a29e); }
      .gi-tl-item.active h4 { color:var(--ink,#292524); }
      .gi-tl-item-sub    { font-size:.7rem; text-transform:uppercase; letter-spacing:.12em; color:var(--ink-faint,#a8a29e); margin-top:2px; }
      .gi-tl-panel { background:var(--bg-sunken,#fafaf9); padding:24px; border-radius:12px; border:1px solid var(--line,#e7e5e4); }
      .gi-tl-panel h3    { font-size:1.5rem; font-weight:700; color:var(--ink,#292524); margin-bottom:4px; }
      .gi-tl-panel-sub   { color:#7eaacc; font-weight:700; text-transform:uppercase; letter-spacing:.1em; font-size:.75rem; margin-bottom:16px; }
      .gi-mission-label  { font-size:.68rem; font-weight:700; color:var(--ink-faint,#a8a29e); text-transform:uppercase; letter-spacing:.12em; margin-bottom:6px; padding-bottom:6px; border-bottom:1px solid var(--line,#e7e5e4); }
      .gi-mission-text   { color:var(--ink-muted,#57534e); font-size:1rem; line-height:1.75; margin-bottom:20px; }
      .gi-tl-hope { background:var(--bg-raised,#fff); padding:16px; border-radius:8px; border-left:4px solid #7eaacc; }
      .gi-tl-hope-label  { font-size:.68rem; font-weight:700; color:#7eaacc; text-transform:uppercase; letter-spacing:.12em; margin-bottom:4px; }
      .gi-tl-hope p      { color:var(--ink,#292524); font-weight:500; font-style:italic; font-size:.9375rem; line-height:1.75; }

      /* ── Section chrome ──────────────────────────────────────── */
      .gi-section      { margin-top:36px; }
      .gi-section-head { margin-bottom:16px; }
      .gi-section-head h2 { font-size:1.2rem; font-weight:700; color:var(--ink,#1c1917); margin-bottom:4px; }
      .gi-section-head p  { font-size:.875rem; color:var(--ink-muted,#57534e); line-height:1.6; }

      /* ── Share banner ────────────────────────────────────────── */
      .gi-share-banner {
        margin-top:44px;
        background:linear-gradient(135deg,rgba(126,170,204,.12),rgba(126,170,204,.05));
        border:1px solid rgba(126,170,204,.28); border-radius:14px; padding:28px 24px;
        text-align:center;
      }
      .gi-share-banner p    { font-size:.9375rem; color:var(--ink-muted,#57534e); margin-bottom:14px; line-height:1.65; }
      .gi-share-btn {
        display:inline-flex; align-items:center; gap:8px;
        background:#7eaacc; color:#fff; border:none; border-radius:50px;
        padding:12px 26px; font:600 .9rem var(--font-ui,sans-serif); cursor:pointer;
        text-decoration:none; transition:background .2s, transform .1s;
      }
      .gi-share-btn:hover  { background:#6394ba; }
      .gi-share-btn:active { transform:scale(.97); }
    </style>

    <section class="grow-page" data-grow="the_gospel_invitation">

      <header class="grow-hero" style="--grow-accent:${accent}">
        <div class="grow-hero-icon">${icon}</div>
        <div class="grow-hero-text">
          <h1 class="grow-hero-title">${title}</h1>
          <p class="grow-hero-sub">${description}</p>
        </div>
      </header>

      <!-- § 1: The Great Invitations -->
      <div class="gi-section">
        <div class="gi-section-head">
          <h2>1. The Great Invitations</h2>
          <p>Jesus issued personal calls characterized by grace rather than performance. Tap each card to uncover the profound hope He offers.</p>
        </div>
        <div class="gi-grid">
          ${INVITATIONS.map(_invCard).join('')}
        </div>
      </div>

      <!-- § 2: The I AM Declarations -->
      <div class="gi-section">
        <div class="gi-section-head">
          <h2>2. The &ldquo;I AM&rdquo; Declarations</h2>
          <p>Seven metaphors from the Gospel of John in which Jesus declares how He perfectly meets the deepest needs of the soul.</p>
        </div>
        <div class="gi-iam-wrap">
          <div class="gi-iam-grid">
            <div class="gi-iam-sidebar" data-bind="iam-nav"></div>
            <div class="gi-iam-content" data-bind="iam-panel"></div>
          </div>
        </div>
      </div>

      <!-- § 3: The Finished Work -->
      <div class="gi-section">
        <div class="gi-section-head">
          <h2>3. The Finished Work</h2>
          <p>Hope is not just found in what Jesus said, but in what He accomplished. Tap each event to understand the historical progression of His redemptive mission.</p>
        </div>
        <div class="gi-tl-wrap">
          <div class="gi-tl-nav" data-bind="tl-nav"></div>
          <div data-bind="tl-panel"></div>
        </div>
      </div>

      <!-- Share with a friend -->
      <div class="gi-share-banner">
        <p>Know someone who needs to hear this?<br><strong>Share this with a friend</strong> &mdash; a hope-filled look at Jesus Christ.</p>
        <button class="gi-share-btn" data-act="share-sms">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91A16 16 0 0 0 16 17l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Share via Text Message
        </button>
      </div>

    </section>
  `;
}

/* ── Mount ───────────────────────────────────────────────────────────────── */

export function mount(root) {
  _wireCards(root);
  _initIAM(root);
  _initTimeline(root);
  _wireShare(root);
  return () => {};
}

/* ── Private helpers ─────────────────────────────────────────────────────── */

function _esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function _invCard(c) {
  return /* html */`
    <div class="gi-card">
      <div class="gi-card-icon">${c.icon}</div>
      <h3>${_esc(c.title)}</h3>
      <p class="gi-card-quote">&ldquo;${_esc(c.quote)}&rdquo;</p>
      <p class="gi-card-ref">${_esc(c.ref)}</p>
      <div class="gi-card-insight">
        <span class="gi-insight-label">The Hope</span>${_esc(c.insight)}
      </div>
      <div class="gi-toggle">+</div>
    </div>
  `;
}

function _wireCards(root) {
  root.querySelectorAll('.gi-card').forEach(card => {
    card.addEventListener('click', () => {
      const insight = card.querySelector('.gi-card-insight');
      const toggle  = card.querySelector('.gi-toggle');
      const wasOpen = insight.classList.contains('open');
      // collapse all
      root.querySelectorAll('.gi-card-insight').forEach(el => el.classList.remove('open'));
      root.querySelectorAll('.gi-toggle').forEach(el => { el.textContent = '+'; });
      if (!wasOpen) { insight.classList.add('open'); toggle.textContent = '−'; }
    });
  });
}

function _initIAM(root) {
  const navEl   = root.querySelector('[data-bind="iam-nav"]');
  const panelEl = root.querySelector('[data-bind="iam-panel"]');
  if (!navEl || !panelEl) return;

  navEl.innerHTML = IAM.map((d, i) => /* html */`
    <div class="gi-iam-nav${i === 0 ? ' active' : ''}" data-iam="${i}">
      <span>${d.icon}</span><span>${_esc(d.label)}</span>
    </div>
  `).join('');

  function showIAM(idx) {
    const d = IAM[idx];
    navEl.querySelectorAll('.gi-iam-nav').forEach((el, i) => el.classList.toggle('active', i === idx));
    panelEl.innerHTML = /* html */`
      <div class="gi-iam-badge">The Declaration</div>
      <div class="gi-iam-title">I AM the<br><span style="color:${d.color}">${_esc(d.label)}</span></div>
      <div class="gi-iam-meta">
        <div>
          <p class="gi-iam-meta-label">The Need Met</p>
          <p class="gi-iam-need">${_esc(d.need)}</p>
        </div>
        <div>
          <p class="gi-iam-meta-label">The Reference</p>
          <p class="gi-iam-verse">${_esc(d.verse)}</p>
        </div>
      </div>
      <p class="gi-iam-desc">${_esc(d.description)}</p>
    `;
  }

  navEl.querySelectorAll('.gi-iam-nav').forEach((el, i) => {
    el.addEventListener('click', () => showIAM(i));
  });
  showIAM(0);
}

function _tlPanel(item) {
  return /* html */`
    <div class="gi-tl-panel">
      <h3>${_esc(item.title)}</h3>
      <p class="gi-tl-panel-sub">${_esc(item.sub)}</p>
      <p class="gi-mission-label">The Mission</p>
      <p class="gi-mission-text">${_esc(item.summary)}</p>
      <div class="gi-tl-hope">
        <p class="gi-tl-hope-label">The Hope</p>
        <p>&ldquo;${_esc(item.hope)}&rdquo;</p>
      </div>
    </div>
  `;
}

function _initTimeline(root) {
  const navEl   = root.querySelector('[data-bind="tl-nav"]');
  const panelEl = root.querySelector('[data-bind="tl-panel"]');
  if (!navEl || !panelEl) return;

  navEl.innerHTML = WORK.map((item, i) => /* html */`
    <div class="gi-tl-item${i === 0 ? ' active' : ''}" data-tl="${i}">
      <h4>${_esc(item.title)}</h4>
      <p class="gi-tl-item-sub">${_esc(item.sub)}</p>
    </div>
  `).join('');

  function showWork(idx) {
    navEl.querySelectorAll('.gi-tl-item').forEach((el, i) => el.classList.toggle('active', i === idx));
    panelEl.innerHTML = _tlPanel(WORK[idx]);
  }

  navEl.querySelectorAll('.gi-tl-item').forEach((el, i) => {
    el.addEventListener('click', () => showWork(i));
  });
  showWork(0);
}

function _wireShare(root) {
  const btn = root.querySelector('[data-act="share-sms"]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Always target the public GROW page — the recipient won't have an account
    const base     = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    const shareUrl = base + 'grow-public.html#the_gospel_invitation';
    const shareMsg = 'I thought you\u2019d appreciate this \u2014 a hope-filled look at Jesus Christ:';

    // Use the native Web Share sheet when available (iOS/Android opens SMS, AirDrop, etc.)
    if (navigator.share) {
      navigator.share({
        title: 'A Hope-Filled View of Jesus Christ',
        text:  shareMsg,
        url:   shareUrl,
      }).catch(() => { /* user cancelled — silent */ });
    } else {
      // Desktop fallback: open the SMS URL scheme directly
      const body = encodeURIComponent(shareMsg + '\n' + shareUrl);
      window.location.href = `sms:?body=${body}`;
    }
  });
}
