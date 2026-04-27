/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: Deployment & Referral
   "How shall they hear without a preacher? — Romans 10:14"

   Phase I stub: routes resolve, the page renders a hero + a placeholder card
   so the navigation feels real. Backend wiring lands when the view's owning
   module is split. Owner module: Blueprint.
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, placeholder, ensureVessels } from '../_frame.js';

export const name  = 'software_deployment_referral';
export const title = 'Deployment & Referral';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'Deployment & Referral',
        subtitle: 'Deployment guide, runbook, and referral tools.',
        scripture: 'How shall they hear without a preacher? — Romans 10:14',
      })}
      ${placeholder({
        title: 'Building this in the new covenant',
        body: 'This page will be built next. It will pull from Blueprint. Until then, navigation works and your place is held.',
      })}
    </section>
  `;
}

export function mount(root /*, ctx */) {
  ensureVessels('the_chalice', 'the_seal', 'the_mantle');
  return () => { /* unmount */ };
}
