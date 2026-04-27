/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: Learn More
   "Come and see. — John 1:46"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: static.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'learn_more';
export const title = 'Learn More';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'Learn More',
        subtitle: 'How to roll FlockOS out at your church.',
        scripture: 'Come and see. — John 1:46',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from static. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
