/* ══════════════════════════════════════════════════════════════════════════════
   THE SIGNET — <flock-toggle>
   "I will set thee as a signet, saith the LORD." — Haggai 2:23

   Accessible boolean toggle. Property `checked` and event `change`.
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockToggle extends HTMLElement {
  static get observedAttributes() { return ['checked', 'disabled', 'label']; }

  connectedCallback() {
    if (this._built) { this._sync(); return; }
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: inline-flex; align-items: center; gap: 8px; user-select: none; }
        button {
          width: 38px; height: 22px; border-radius: 999px; border: 0;
          background: var(--line, #cdd2dd); position: relative; cursor: pointer;
          transition: background .15s ease;
        }
        button::after {
          content: ''; position: absolute; top: 2px; left: 2px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: transform .18s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        :host([checked]) button { background: var(--accent, #e8a838); }
        :host([checked]) button::after { transform: translateX(16px); }
        :host([disabled]) button { opacity: 0.55; cursor: not-allowed; }
        .lbl { font: 0.92rem 'Noto Sans', sans-serif; color: var(--ink, #1b264f); }
      </style>
      <button type="button" role="switch" aria-checked="false"></button>
      <span class="lbl"><slot></slot></span>
    `;
    shadow.querySelector('button').addEventListener('click', () => {
      if (this.hasAttribute('disabled')) return;
      this.checked = !this.checked;
    });
  }

  attributeChangedCallback() { if (this._built) this._sync(); }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) {
    if (v) this.setAttribute('checked', ''); else this.removeAttribute('checked');
    this.dispatchEvent(new CustomEvent('change', { detail: { checked: this.checked } }));
  }

  _sync() {
    const btn = this.shadowRoot.querySelector('button');
    btn.setAttribute('aria-checked', String(this.checked));
  }
}

if (!customElements.get('flock-toggle')) customElements.define('flock-toggle', FlockToggle);
