/* ══════════════════════════════════════════════════════════════════════════════
   THE MANTLE — <flock-skeleton>
   "Elisha picked up Elijah’s mantle that had fallen from him." — 2 Kings 2:13

   Loading skeleton — shape-of-content placeholder, never a spinner.

   Attributes:
     rows="3"   — number of bar rows
     width="60%" — bar width (CSS length)
     height="14px"
   ══════════════════════════════════════════════════════════════════════════════ */

class FlockSkeleton extends HTMLElement {
  connectedCallback() {
    if (this._built) return;
    this._built = true;
    const rows   = Math.max(1, parseInt(this.getAttribute('rows') || '3', 10));
    const width  = this.getAttribute('width')  || '100%';
    const height = this.getAttribute('height') || '14px';
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host { display: block; }
        .bar {
          width: ${width}; height: ${height};
          margin: 8px 0; border-radius: 6px;
          background: linear-gradient(90deg, var(--bg, #f1f3f9) 0%, var(--bg-raised, #fff) 50%, var(--bg, #f1f3f9) 100%);
          background-size: 200% 100%;
          animation: mantle-shimmer 1.4s linear infinite;
        }
        .bar.short { width: calc(${width} - 18%); }
        @keyframes mantle-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (prefers-reduced-motion: reduce) { .bar { animation: none; opacity: 0.5; } }
      </style>
      ${Array.from({ length: rows }, (_, i) => `<div class="bar${i === rows - 1 ? ' short' : ''}"></div>`).join('')}
    `;
  }
}

if (!customElements.get('flock-skeleton')) customElements.define('flock-skeleton', FlockSkeleton);
