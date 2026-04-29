/* ══════════════════════════════════════════════════════════════════════════════
   THE MENORAH — <flock-tabs>
   "Make a lampstand of pure gold... seven lamps." — Exodus 25:31

   Declarative tabs. Tab list comes from the slotted [slot="tab"] elements,
   panels from [slot="panel"]. They pair by order.

   Usage:
     <flock-tabs>
       <button slot="tab">Channels</button>
       <button slot="tab">DMs</button>
       <section slot="panel">…</section>
       <section slot="panel">…</section>
     </flock-tabs>
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockTabs extends HTMLElement {
  connectedCallback() {
    if (this._built) return;
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .tabs {
          display: flex; gap: 4px; padding: 4px;
          border-bottom: 1px solid var(--line, #e5e7ef);
        }
        ::slotted([slot="tab"]) {
          padding: 8px 14px; border: 0; background: transparent;
          font: 600 0.92rem 'Noto Sans', sans-serif;
          color: var(--ink-muted, #7a7f96);
          border-radius: 8px 8px 0 0; cursor: pointer;
        }
        ::slotted([slot="tab"][aria-selected="true"]) {
          color: var(--ink, #1b264f);
          background: var(--bg-raised, #fff);
          box-shadow: 0 -1px 0 var(--accent, #e8a838) inset;
        }
        ::slotted([slot="panel"]) { display: none; padding: 14px 4px; }
        ::slotted([slot="panel"][data-active]) { display: block; }
      </style>
      <div class="tabs"><slot name="tab"></slot></div>
      <div><slot name="panel"></slot></div>
    `;

    const tabs   = () => Array.from(this.querySelectorAll(':scope > [slot="tab"]'));
    const panels = () => Array.from(this.querySelectorAll(':scope > [slot="panel"]'));

    const select = (i) => {
      tabs().forEach((t, idx)   => t.setAttribute('aria-selected', idx === i ? 'true' : 'false'));
      panels().forEach((p, idx) => idx === i ? p.setAttribute('data-active', '') : p.removeAttribute('data-active'));
      this.dispatchEvent(new CustomEvent('change', { detail: { index: i } }));
    };

    this.addEventListener('click', (e) => {
      const t = e.target.closest('[slot="tab"]');
      if (!t) return;
      const i = tabs().indexOf(t);
      if (i >= 0) select(i);
    });
    select(0);
  }
}

if (!customElements.get('flock-tabs')) customElements.define('flock-tabs', FlockTabs);
