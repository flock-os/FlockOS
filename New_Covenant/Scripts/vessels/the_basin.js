/* ══════════════════════════════════════════════════════════════════════════════
   THE BASIN — <flock-input>
   "He poured water into a basin and began to wash the disciples’ feet." — Jn 13:5

   Labelled input with inline error slot. Validation is done by the caller
   using the_stones; this component only renders.
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockInput extends HTMLElement {
  static get observedAttributes() { return ['label', 'type', 'placeholder', 'value', 'error', 'name']; }

  connectedCallback() {
    if (this._built) { this._sync(); return; }
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        label { display: flex; flex-direction: column; gap: 4px; font: 0.9rem 'Noto Sans', sans-serif; color: var(--ink-muted, #7a7f96); }
        input { padding: 10px 12px; border: 1px solid var(--line, #e5e7ef); border-radius: 8px; font: inherit; color: var(--ink, #1b264f); background: var(--bg-raised, #fff); }
        input:focus { outline: 2px solid var(--accent, #e8a838); outline-offset: 1px; }
        .err { color: #b91c1c; font-size: 0.8rem; min-height: 1em; }
      </style>
      <label>
        <span class="lbl"></span>
        <input>
      </label>
      <div class="err"></div>
    `;
    this._sync();
    shadow.querySelector('input').addEventListener('input', (e) => {
      this.value = e.target.value;
      this.dispatchEvent(new CustomEvent('change', { detail: { value: e.target.value } }));
    });
  }

  attributeChangedCallback() { if (this._built) this._sync(); }

  _sync() {
    const sh = this.shadowRoot;
    sh.querySelector('.lbl').textContent = this.getAttribute('label') || '';
    const input = sh.querySelector('input');
    input.type        = this.getAttribute('type') || 'text';
    input.placeholder = this.getAttribute('placeholder') || '';
    input.name        = this.getAttribute('name') || '';
    if (this.hasAttribute('value')) input.value = this.getAttribute('value');
    sh.querySelector('.err').textContent = this.getAttribute('error') || '';
  }
}

if (!customElements.get('flock-input')) customElements.define('flock-input', FlockInput);
