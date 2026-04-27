/* ══════════════════════════════════════════════════════════════════════════════
   THE LAMPSTAND — Splash & flash-prevention
   "You are the light of the world. A city set on a hill cannot be hidden." — Mt 5:14

   The Lampstand controls the brief light that covers boot. It does NOT own
   themes — Adornment (fine_linen.js) owns the 14-theme palette. This module
   only manages the splash screen that hides flash-of-unstyled-content.

   Public API:
     kindle()      — show splash (idempotent)
     darken()      — fade splash out (calls the_oil for the fade)
     isLit()       — boolean
   ══════════════════════════════════════════════════════════════════════════════ */

import { fade } from './the_oil.js';

const SPLASH_ID = 'the-lampstand-splash';
let _lit = false;

export function kindle() {
  if (_lit) return;
  _lit = true;
  if (document.getElementById(SPLASH_ID)) return;

  const el = document.createElement('div');
  el.id = SPLASH_ID;
  el.className = 'lampstand';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading');
  el.innerHTML = `
    <div class="lampstand-glow" aria-hidden="true"></div>
    <div class="lampstand-flame" aria-hidden="true"></div>
    <div class="lampstand-word">FlockOS</div>
    <div class="lampstand-sub">Ministry Operating System</div>
  `;
  // Inline position/z-index only — colors live in new_covenant.css .lampstand
  el.style.cssText = `position: fixed; inset: 0; z-index: 99999;`;

  // Boot-time flame fallback — new_covenant.css may not have loaded yet at kindle().
  const style = document.createElement('style');
  style.textContent = `
    .lampstand {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 20px;
      background: linear-gradient(170deg, #0c1445 0%, #1a0e3c 55%, #0a1128 100%);
      transition: opacity 0.38s ease;
    }
    .lampstand.is-leaving { opacity: 0; pointer-events: none; }
    .lampstand .lampstand-flame {
      width: 56px; height: 56px; border-radius: 50%;
      background: radial-gradient(circle at 50% 35%,
        #fffbe0 0%, #ffd24a 28%, #e88820 58%, rgba(192,80,20,0.40) 88%, transparent 100%);
      box-shadow: 0 0 40px rgba(232,168,56,0.75), 0 0 90px rgba(232,168,56,0.32);
      animation: _flicker 1.8s ease-in-out infinite;
    }
    .lampstand .lampstand-word {
      font: 700 1.6rem/1 'Noto Serif', Georgia, serif;
      letter-spacing: 0.12em; text-transform: uppercase;
      background: linear-gradient(135deg, #ffe9a0, #e8a838, #c47a10);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .lampstand .lampstand-sub {
      font: 0.82rem 'Noto Sans', sans-serif;
      color: rgba(255,255,255,0.34); letter-spacing: 0.07em;
    }
    @keyframes _flicker {
      0%,100% { transform: scale(1)    rotate(-1deg); opacity: 0.95; }
      25%     { transform: scale(1.08) rotate(1.5deg); opacity: 1;   }
      50%     { transform: scale(0.96) rotate(-.5deg); opacity: 0.90; }
      75%     { transform: scale(1.04) rotate(1deg);  opacity: 1;   }
    }
    @media (prefers-reduced-motion: reduce) {
      .lampstand .lampstand-flame { animation: none; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(el);
}

export async function darken() {
  if (!_lit) return;
  const el = document.getElementById(SPLASH_ID);
  if (!el) { _lit = false; return; }
  await fade(el, { from: 1, to: 0, duration: 320 });
  el.remove();
  _lit = false;
}

export function isLit() { return _lit; }
