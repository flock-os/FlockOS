/* ══════════════════════════════════════════════════════════════════════════════
   THE SEAL — <flock-button>
   "He hath sealed us, and given the earnest of the Spirit." — 2 Cor 1:22
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockButton extends HTMLElement {
  static get observedAttributes() { return ['tone', 'size', 'disabled', 'loading']; }

  connectedCallback() {
    if (this._built) { this._sync(); return; }
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: inline-block; }
        button {
          font: 600 0.92rem 'Noto Sans', sans-serif;
          padding: 9px 16px; border-radius: 9px; border: 1px solid transparent;
          cursor: pointer; transition: transform .08s ease, opacity .15s ease;
        }
        button:active { transform: translateY(1px); }
        button[disabled] { opacity: 0.55; cursor: not-allowed; }

        :host([tone="primary"]) button { background: var(--accent, #e8a838); color: #fff; }
        :host([tone="ghost"])   button { background: transparent; color: var(--ink, #1b264f); border-color: var(--line, #e5e7ef); }
        :host([tone="danger"])  button { background: #b91c1c; color: #fff; }
        :host(:not([tone])) button     { background: var(--bg, #f7f8fb); color: var(--ink, #1b264f); border-color: var(--line, #e5e7ef); }

        :host([size="sm"]) button { padding: 6px 12px; font-size: 0.85rem; }
        :host([size="lg"]) button { padding: 12px 20px; font-size: 1rem; }
      </style>
      <button type="button"><slot></slot></button>
    `;
    this._sync();
    shadow.querySelector('button').addEventListener('click', (e) => {
      if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    });
  }

  attributeChangedCallback() { if (this._built) this._sync(); }

  _sync() {
    const btn = this.shadowRoot.querySelector('button');
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) btn.setAttribute('disabled', '');
    else btn.removeAttribute('disabled');
  }
}

if (!customElements.get('flock-button')) customElements.define('flock-button', FlockButton);
