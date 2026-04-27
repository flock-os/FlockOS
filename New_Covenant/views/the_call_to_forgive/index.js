/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Call to Forgive
   "Forgive, and ye shall be forgiven. — Luke 6:37"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: TheLife / TheScrolls.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'the_call_to_forgive';
export const title = 'The Call to Forgive';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'The Call to Forgive',
        subtitle: 'Reconciliation tools and pastoral conversations.',
        scripture: 'Forgive, and ye shall be forgiven. — Luke 6:37',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from TheLife / TheScrolls. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
