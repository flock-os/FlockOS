/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE GOOD SHEPHERD — Home / dashboard
   "I am the good shepherd; I know my sheep and my sheep know me." — John 10:14

   Live home page now wired to all three real backends:
     • Fellowship card  → the_upper_room.unreadTotal()       (Firebase)
     • Care card        → TheLife.pendingCount()              (GAS)
     • Today card       → TheSeason.todayCount()              (GAS)
     • Next steps       → TheLife.careCases / compassionList  (GAS)
     • Recent feed      → comms.summary().recentInteractions  (TheScrolls / GAS)
   ══════════════════════════════════════════════════════════════════════════════ */

import { renderPasture }   from './the_pasture.js';
import { mountCount }       from './the_count.js';
import { mountFlockFeed }   from './the_flock_feed.js';
import { mountNextSteps }   from './the_next_steps.js';
import { renderCall }       from './the_call.js';
import { profile }          from '../../Scripts/the_priesthood/index.js';

export const name  = 'the_good_shepherd';
export const title = 'The Good Shepherd';

export function render(/* params */) {
  const me = profile();
  return /* html */ `
    <section class="pasture">
      ${renderPasture(me)}

      <div class="pasture-grid">
        <div data-bind="fellowship-summary" data-jump="the_fellowship"><flock-skeleton rows="3"></flock-skeleton></div>
        <div data-bind="care-summary"       data-jump="the_life"><flock-skeleton rows="3"></flock-skeleton></div>
        <div data-bind="today"              data-jump="the_seasons"><flock-skeleton rows="3"></flock-skeleton></div>
      </div>

      <div class="pasture-row">
        <flock-card>
          <h3 slot="title">Next steps</h3>
          <div data-bind="next">
            <flock-skeleton rows="3"></flock-skeleton>
          </div>
        </flock-card>
        <flock-card>
          <h3 slot="title">Recent across the flock</h3>
          <div data-bind="feed">
            <flock-skeleton rows="4"></flock-skeleton>
          </div>
        </flock-card>
      </div>

      <div class="pasture-cta" data-bind="primary-cta"></div>
    </section>
  `;
}

export function mount(root, ctx) {
  // Lazy-load vessels we use on this page.
  import('../../Scripts/vessels/the_chalice.js').catch(() => {});
  import('../../Scripts/vessels/the_mantle.js').catch(() => {});
  import('../../Scripts/vessels/the_seal.js').catch(() => {});

  // Click stat cards to jump.
  root.querySelectorAll('[data-bind][data-jump]').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const where = card.getAttribute('data-jump');
      if (where && ctx && ctx.go) ctx.go(where);
    });
  });

  const stops = [];
  stops.push(mountCount(root.querySelector('[data-bind="fellowship-summary"]'), 'fellowship'));
  stops.push(mountCount(root.querySelector('[data-bind="care-summary"]'),       'care'));
  stops.push(mountCount(root.querySelector('[data-bind="today"]'),              'today'));
  stops.push(mountNextSteps(root.querySelector('[data-bind="next"]'),           ctx));
  stops.push(mountFlockFeed(root.querySelector('[data-bind="feed"]'),           ctx));

  const ctaSlot = root.querySelector('[data-bind="primary-cta"]');
  if (ctaSlot) ctaSlot.appendChild(renderCall(ctx));

  // Auto-refresh while the user lingers on the home view.
  const tick = setInterval(() => {
    stops.forEach((fn, i) => { /* no-op; manna TTL drives the actual refetch */ });
  }, 60_000);

  return () => {
    clearInterval(tick);
    stops.forEach((fn) => { try { fn && fn(); } catch (_) {} });
  };
}
