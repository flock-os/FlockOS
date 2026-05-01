/* ══════════════════════════════════════════════════════════════════════════════
   THE CENSER — <flock-modal>
   "The smoke of the incense, with the prayers of the saints,
    ascended up before God." — Revelation 8:4

   Lightweight modal with an open() / close() API and a 'flock-modal:close'
   event. Slot 'title' for the header, default slot for body, slot 'actions'
   for the footer button row.

   Attributes:
     open       — present = visible
     dismissible — default true; if 'false', backdrop & Esc do nothing
     size       — 'sm' | 'md' | 'lg' (default 'md')
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockModal extends HTMLElement {
  static get observedAttributes() { return ['open', 'size']; }

  connectedCallback() {
    if (this._built) { this._sync(); return; }
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: none; }
        :host([open]) {
          display: flex; position: fixed; inset: 0; z-index: 9200;
          background: rgba(20,24,40,0.45);
          align-items: center; justify-content: center;
        }
        .panel {
          background: var(--bg-raised, #fff); color: var(--ink, #1b264f);
          width: min(520px, 92vw); border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          padding: 20px 22px; display: flex; flex-direction: column; gap: 12px;
          font: 1rem/1.45 'Noto Sans', sans-serif;
        }
        :host([size="sm"]) .panel { width: min(360px, 92vw); }
        :host([size="lg"]) .panel { width: min(720px, 96vw); }
        ::slotted([slot="title"]) { margin: 0; font: 600 1.1rem 'Noto Serif', Georgia, serif; }
        .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; }
      </style>
      <div class="panel" role="dialog" aria-modal="true">
        <slot name="title"></slot>
        <div class="body"><slot></slot></div>
        <div class="actions"><slot name="actions"></slot></div>
      </div>
    `;
    this.addEventListener('click', (e) => {
      if (this.getAttribute('dismissible') === 'false') return;
      if (e.target === this) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (this.hasAttribute('open') && e.key === 'Escape' &&
          this.getAttribute('dismissible') !== 'false') this.close();
    });
  }

  attributeChangedCallback() { if (this._built) this._sync(); }

  open()  { this.setAttribute('open', ''); }
  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('flock-modal:close'));
  }
  _sync() {/* hook */}
}

if (!customElements.get('flock-modal')) customElements.define('flock-modal', FlockModal);
