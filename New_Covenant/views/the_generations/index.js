/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Generations
   "One generation shall praise thy works to another. — Psalm 145:4"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: TheVine.luke + TheScrolls.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'the_generations';
export const title = 'The Generations';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'The Generations',
        subtitle: 'History, timeline, and the long story of the church.',
        scripture: 'One generation shall praise thy works to another. — Psalm 145:4',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from TheVine.luke + TheScrolls. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
