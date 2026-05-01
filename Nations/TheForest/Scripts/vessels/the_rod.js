/* ══════════════════════════════════════════════════════════════════════════════
   THE ROD — <flock-progress>
   "Thy rod and thy staff they comfort me." — Psalm 23:4

   Determinate or indeterminate progress bar.

   Attributes:
     value="0..100"   — present + numeric = determinate
     (none)           — indeterminate animated
     label            — accessible label
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockProgress extends HTMLElement {
  static get observedAttributes() { return ['value', 'label']; }

  connectedCallback() {
    if (this._built) { this._sync(); return; }
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .track {
          position: relative; height: 6px; border-radius: 999px;
          background: var(--line, #e5e7ef); overflow: hidden;
        }
        .fill {
          position: absolute; inset: 0; width: 0%;
          background: var(--accent, #e8a838);
          transition: width .25s ease;
        }
        :host(:not([value])) .fill {
          width: 30%;
          animation: rod-cycle 1.4s ease-in-out infinite;
        }
        @keyframes rod-cycle {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(380%); }
        }
        @media (prefers-reduced-motion: reduce) {
          :host(:not([value])) .fill { animation: none; width: 100%; opacity: 0.5; }
        }
      </style>
      <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="fill"></div>
      </div>
    `;
  }

  attributeChangedCallback() { if (this._built) this._sync(); }

  _sync() {
    const sh = this.shadowRoot;
    const track = sh.querySelector('.track');
    const fill  = sh.querySelector('.fill');
    track.setAttribute('aria-label', this.getAttribute('label') || 'progress');
    if (this.hasAttribute('value')) {
      const v = Math.max(0, Math.min(100, Number(this.getAttribute('value')) || 0));
      fill.style.width = v + '%';
      track.setAttribute('aria-valuenow', String(v));
    } else {
      track.removeAttribute('aria-valuenow');
    }
  }
}

if (!customElements.get('flock-progress')) customElements.define('flock-progress', FlockProgress);
