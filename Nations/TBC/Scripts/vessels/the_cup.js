/* ══════════════════════════════════════════════════════════════════════════════
   THE CUP — <flock-select>
   "The cup of blessing which we bless." — 1 Corinthians 10:16

   Native <select> wrapper with consistent visual chrome. Pass options via
   the `options` property (array of {value, label}) or as <option> children.
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockSelect extends HTMLElement {
  static get observedAttributes() { return ['label', 'value', 'name']; }

  connectedCallback() {
    if (this._built) { this._sync(); return; }
    this._built = true;
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        label { display: flex; flex-direction: column; gap: 4px;
                font: 0.9rem 'Noto Sans', sans-serif; color: var(--ink-muted, #7a7f96); }
        select { padding: 9px 12px; border: 1px solid var(--line, #e5e7ef);
                 border-radius: 8px; background: var(--bg-raised, #fff);
                 color: var(--ink, #1b264f); font: inherit; }
        select:focus { outline: 2px solid var(--accent, #e8a838); outline-offset: 1px; }
      </style>
      <label>
        <span class="lbl"></span>
        <select></select>
      </label>
    `;
    shadow.querySelector('select').addEventListener('change', (e) => {
      this.setAttribute('value', e.target.value);
      this.dispatchEvent(new CustomEvent('change', { detail: { value: e.target.value } }));
    });
  }

  attributeChangedCallback() { if (this._built) this._sync(); }

  set options(list) {
    this._options = Array.isArray(list) ? list : [];
    this._sync();
  }
  get options() { return this._options || []; }

  _sync() {
    const sh = this.shadowRoot;
    sh.querySelector('.lbl').textContent = this.getAttribute('label') || '';
    const sel = sh.querySelector('select');
    sel.name = this.getAttribute('name') || '';
    if (this._options) {
      sel.innerHTML = this._options
        .map((o) => `<option value="${_e(o.value)}">${_e(o.label || o.value)}</option>`)
        .join('');
    }
    if (this.hasAttribute('value')) sel.value = this.getAttribute('value');
  }
}

function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

if (!customElements.get('flock-select')) customElements.define('flock-select', FlockSelect);
