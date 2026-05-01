/* ══════════════════════════════════════════════════════════════════════════════
   THE REFRESH — Pull-to-refresh for the courtyard scroll container
   "Create in me a clean heart, O God; and renew a right spirit within me."
   — Psalm 51:10

   Attaches a native-feeling pull-to-refresh gesture to the main scroll
   container (#the-holy-place). On release it calls the_scribes `reload()`
   which re-runs the current view's render + mount cycle.

   Rules:
   • Only fires when scrollTop === 0 (actually at the top)
   • Threshold: 72px pull
   • Max visual pull: 96px
   • Does nothing if a refresh is already in flight
   ══════════════════════════════════════════════════════════════════════════════ */

const THRESHOLD   = 72;   // px pull needed to trigger
const MAX_PULL    = 96;   // px max visual displacement
const ANIM_MS     = 300;  // transition duration

let _indicator = null;
let _active    = false;

export function mountRefresh(scrollEl, onRefresh) {
  if (!scrollEl || !('ontouchstart' in window)) return;

  _ensureIndicator(scrollEl);

  let startY    = 0;
  let pulling   = false;
  let refreshing = false;

  scrollEl.addEventListener('touchstart', (e) => {
    if (refreshing) return;
    if (scrollEl.scrollTop > 0) return;  // only when at the very top
    startY  = e.touches[0].clientY;
    pulling = true;
  }, { passive: true });

  scrollEl.addEventListener('touchmove', (e) => {
    if (!pulling || refreshing) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { pulling = false; _setProgress(0); return; }

    // Rubber-band: pull decelerates as it approaches MAX_PULL
    const progress = Math.min(dy / THRESHOLD, MAX_PULL / THRESHOLD);
    const visual   = Math.min(dy * 0.45, MAX_PULL);

    _setProgress(progress, visual);
  }, { passive: true });

  scrollEl.addEventListener('touchend', async () => {
    if (!pulling || refreshing) { pulling = false; return; }
    pulling = false;

    const indicator = _indicator;
    const reached = indicator && parseFloat(indicator.style.getPropertyValue('--ptr-pull')) >= THRESHOLD * 0.45;

    if (!reached) { _setProgress(0); return; }

    // Trigger refresh
    refreshing = true;
    _setSpinning(true);

    try {
      await onRefresh();
    } catch (_) { /* view reload errors are non-fatal */ }

    // Brief pause so the spinner is visible even on fast reloads
    await new Promise(r => setTimeout(r, 420));
    _setSpinning(false);
    _setProgress(0);
    refreshing = false;
  }, { passive: true });
}

/* ── Private helpers ───────────────────────────────────────────────────────── */

function _ensureIndicator(scrollEl) {
  if (_indicator) return;

  const el = document.createElement('div');
  el.id = 'ptr-indicator';
  el.innerHTML = `
    <div class="ptr-track">
      <div class="ptr-spinner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 6.36 2.63L21 3v6h-6"/>
        </svg>
      </div>
    </div>
  `;
  el.style.cssText = `
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
    overflow: visible;
    z-index: 9000;
    pointer-events: none;
  `;

  const style = document.createElement('style');
  style.textContent = `
    #ptr-indicator .ptr-track {
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%) translateY(calc(var(--ptr-visual, 0px) - 44px));
      transition: transform ${ANIM_MS}ms cubic-bezier(.2,.8,.4,1), opacity ${ANIM_MS}ms ease;
      opacity: 0;
      will-change: transform, opacity;
    }
    #ptr-indicator .ptr-spinner {
      width: 36px; height: 36px;
      background: var(--bg-raised, #fff);
      border: 1px solid var(--line, #e0ddd7);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      color: var(--accent, #e8a838);
    }
    #ptr-indicator .ptr-spinner svg {
      width: 18px; height: 18px;
      transition: transform ${ANIM_MS}ms ease;
    }
    #ptr-indicator.is-visible .ptr-track {
      opacity: 1;
    }
    #ptr-indicator.is-spinning .ptr-spinner svg {
      animation: ptr-spin 0.7s linear infinite;
    }
    @keyframes ptr-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // Insert before the courtyard slot inside the scroll container
  scrollEl.insertBefore(el, scrollEl.firstChild);
  _indicator = el;
}

function _setProgress(ratio, visualPx) {
  if (!_indicator) return;
  const visual = visualPx !== undefined ? visualPx : ratio * THRESHOLD * 0.45;
  _indicator.style.setProperty('--ptr-visual', visual + 'px');
  _indicator.style.setProperty('--ptr-pull', visual + 'px');

  const track = _indicator.querySelector('.ptr-track');
  if (track) {
    track.style.transform = `translateX(-50%) translateY(calc(${visual}px - 44px))`;
    track.style.opacity   = String(Math.min(ratio, 1));
  }

  if (ratio > 0) {
    _indicator.classList.add('is-visible');
  } else {
    _indicator.classList.remove('is-visible');
    if (track) { track.style.transform = ''; track.style.opacity = ''; }
  }

  // Rotate arrow icon with pull progress (0 → 180deg = ready)
  const svg = _indicator.querySelector('svg');
  if (svg) svg.style.transform = `rotate(${Math.min(ratio, 1) * 180}deg)`;
}

function _setSpinning(on) {
  if (!_indicator) return;
  const track = _indicator.querySelector('.ptr-track');
  if (on) {
    _indicator.classList.add('is-visible', 'is-spinning');
    if (track) { track.style.transform = 'translateX(-50%) translateY(4px)'; track.style.opacity = '1'; }
  } else {
    _indicator.classList.remove('is-spinning');
  }
}
