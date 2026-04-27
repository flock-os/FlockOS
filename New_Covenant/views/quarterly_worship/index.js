/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: Quarterly Worship
   "Sing unto the LORD a new song. — Psalm 96:1"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: the_shofar + TheHarvest.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'quarterly_worship';
export const title = 'Quarterly Worship';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'Quarterly Worship',
        subtitle: 'Quarterly worship plans and arts calendar.',
        scripture: 'Sing unto the LORD a new song. — Psalm 96:1',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from the_shofar + TheHarvest. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
