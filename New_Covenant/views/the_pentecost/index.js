/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Pentecost
   "And suddenly there came a sound from heaven as of a rushing mighty wind. — Acts 2:2"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: TheHarvest.listEvents.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'the_pentecost';
export const title = 'The Pentecost';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'The Pentecost',
        subtitle: 'Events, gatherings, and the outpouring.',
        scripture: 'And suddenly there came a sound from heaven as of a rushing mighty wind. — Acts 2:2',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from TheHarvest.listEvents. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
