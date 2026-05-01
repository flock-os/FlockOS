/* ══════════════════════════════════════════════════════════════════════════════
   THE COURTYARD — Main view slot
   "I will yet again make thee to dwell in tabernacles." — Hosea 12:9
   ══════════════════════════════════════════════════════════════════════════════ */

export function mountCourtyard(host) {
  if (!host) return null;
  host.style.cssText = `
    display: block; min-height: calc(100dvh - 56px);
    padding: 24px clamp(16px, 4vw, 48px) 64px;
    background: var(--bg, #f7f8fb); color: var(--ink, #1b264f);
    overflow-y: auto;
  `;
  // Inner slot lets us swap content without losing scroll listeners on host.
  let slot = host.querySelector(':scope > .courtyard-slot');
  if (!slot) {
    slot = document.createElement('div');
    slot.className = 'courtyard-slot';
    slot.style.cssText = `max-width: 1200px; margin: 0 auto;`;
    host.appendChild(slot);
  }
  return slot;
}
