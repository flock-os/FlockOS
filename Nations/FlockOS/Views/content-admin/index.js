/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: CONTENT ADMIN — Truth Editor wrapper
   "Sanctify them through thy truth: thy word is truth." — John 17:17

   Thin wrapper that mounts the TheTruth module (Pastor/Admin content editor)
   inside the standard view shell.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'content-admin';
export const title = 'Truth Editor';

export function render() {
  return /* html */`
    <section class="content-admin-view">
      ${pageHero({
        title:    'Truth Editor',
        subtitle: 'Add, edit, and publish teaching content across all categories.',
        scripture: 'Sanctify them through thy truth: thy word is truth. — John 17:17',
      })}
      <div id="content-admin-host" style="margin-top:16px;"></div>
    </section>
  `;
}

export function mount(root) {
  const host = root.querySelector('#content-admin-host');
  if (!host) return;

  function _render() {
    if (typeof window.TheTruth === 'undefined' || typeof window.TheTruth.render !== 'function') {
      host.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--ink-muted);">'
        + '<div style="font-size:2.4rem;margin-bottom:10px;">&#9881;</div>'
        + '<p>Truth Editor module not loaded.</p></div>';
      return;
    }
    var session = (typeof window.TheVine !== 'undefined' && window.TheVine.session)
      ? window.TheVine.session()
      : null;
    try {
      var p = window.TheTruth.render(host, session);
      if (p && typeof p.catch === 'function') p.catch(function(err) {
        console.warn('[content-admin] TheTruth.render error', err);
      });
    } catch (err) {
      console.warn('[content-admin] TheTruth.render threw', err);
    }
  }

  // If TheTruth isn't on window yet (rare race), wait briefly then retry.
  if (typeof window.TheTruth === 'undefined') {
    var tries = 0;
    var t = setInterval(function() {
      tries++;
      if (typeof window.TheTruth !== 'undefined' || tries > 20) {
        clearInterval(t);
        _render();
      }
    }, 100);
  } else {
    _render();
  }
}
