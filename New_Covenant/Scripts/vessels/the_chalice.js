/* ══════════════════════════════════════════════════════════════════════════════
   THE CHALICE — <flock-card>
   "My cup runneth over." — Psalm 23:5

   A simple semantic card container. Use anywhere we need a raised surface
   with consistent padding and rounded corners.

   Usage:
     <flock-card>
       <h3 slot="title">Pasture</h3>
       <p>Body text…</p>
     </flock-card>
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockCard extends HTMLElement {
  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block; background: var(--bg-raised, #fff);
          color: var(--ink, #1b264f);
          border: 1px solid var(--line, #e5e7ef);
          border-radius: 14px; padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(20,24,40,0.04);
        }
        ::slotted([slot="title"]) { margin: 0 0 8px; font: 600 1.05rem 'Noto Serif', Georgia, serif; }
      </style>
      <slot name="title"></slot>
      <slot></slot>
    `;
  }
}

if (!customElements.get('flock-card')) customElements.define('flock-card', FlockCard);
