/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: The Invitation
   "Come unto me, all ye that labour and are heavy laden. — Matthew 11:28"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: —.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'the_invitation';
export const title = 'The Invitation';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'The Invitation',
        subtitle: 'Sign in or create your account.',
        scripture: 'Come unto me, all ye that labour and are heavy laden. — Matthew 11:28',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from —. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
