/* ══════════════════════════════════════════════════════════════════════════════
   THE OIL — Animation primitives
   "You anoint my head with oil; my cup overflows." — Psalm 23:5

   Every animation in the new shell goes through here. Single source of motion
   means we honour prefers-reduced-motion in exactly one place.

   Public API:
     fade(el, { from, to, duration })   — opacity transition, returns Promise
     slide(el, { from, to, axis, duration }) — translateX/Y transition
     prefersReducedMotion()             — boolean
   ══════════════════════════════════════════════════════════════════════════════ */

const _RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

export function prefersReducedMotion() {
  return !!(_RM && _RM.matches);
}

export function fade(el, { from = 0, to = 1, duration = 240 } = {}) {
  if (!el) return Promise.resolve();
  if (prefersReducedMotion()) {
    el.style.opacity = String(to);
    return Promise.resolve();
  }
  return _animate(el, [{ opacity: from }, { opacity: to }], { duration });
}

export function slide(el, { from = 16, to = 0, axis = 'y', duration = 260 } = {}) {
  if (!el) return Promise.resolve();
  const prop = axis === 'x' ? 'translateX' : 'translateY';
  if (prefersReducedMotion()) {
    el.style.transform = `${prop}(${to}px)`;
    return Promise.resolve();
  }
  return _animate(
    el,
    [{ transform: `${prop}(${from}px)`, opacity: 0 }, { transform: `${prop}(${to}px)`, opacity: 1 }],
    { duration, easing: 'cubic-bezier(.2,.7,.2,1)' }
  );
}

function _animate(el, frames, opts) {
  return new Promise((resolve) => {
    if (typeof el.animate !== 'function') {
      // Fallback: just snap to last frame
      Object.assign(el.style, frames[frames.length - 1]);
      resolve();
      return;
    }
    const anim = el.animate(frames, { fill: 'forwards', easing: 'ease', ...opts });
    anim.onfinish = () => resolve();
    anim.oncancel = () => resolve();
  });
}
