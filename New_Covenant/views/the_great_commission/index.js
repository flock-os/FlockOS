/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Great Commission
   "Go ye therefore, and teach all nations. — Matthew 28:19"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: missionsRegistry (TheVine.mark).
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'the_great_commission';
export const title = 'The Great Commission';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'The Great Commission',
        subtitle: 'Missions, partners, regions, prayer focus.',
        scripture: 'Go ye therefore, and teach all nations. — Matthew 28:19',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from missionsRegistry (TheVine.mark). Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
