/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE FELLOWSHIP — Unified comms surface inside FlockOS
   "And they continued stedfastly… in fellowship." — Acts 2:42

   One page, four tabs, three comms sources (see Scripts/the_comms.js):
     • Channels      — Firebase / TheUpperRoom (per-church)
     • Direct        — Firebase DMs
     • FlockChat     — embedded standalone PWA (?church= matches tenant)
     • Interactions  — GAS interaction ledger (TheScrolls)
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero, ensureVessels } from '../_frame.js';
import { renderChannelsPane }     from './the_channel_list.js';
import { renderDmsPane }          from './the_dm_drawer.js';
import { renderFlockchatPane }    from './the_flockchat_pane.js';
import { renderInteractionsPane } from './the_interactions_pane.js';

export const name  = 'the_fellowship';
export const title = 'Fellowship';

export function render(/* params */) {
  return `
    <section>
      ${pageHero({
        title: 'Fellowship',
        subtitle: 'Channels, direct messages, FlockChat, and the pastoral ledger — all in one room.',
        scripture: 'And they continued stedfastly… in fellowship. — Acts 2:42',
      })}
      <flock-tabs id="fellowship-tabs">
        <button slot="tab" type="button">Channels</button>
        <button slot="tab" type="button">Direct</button>
        <button slot="tab" type="button">FlockChat</button>
        <button slot="tab" type="button">Interactions</button>
        <section slot="panel" data-pane="channels"><flock-skeleton rows="4"></flock-skeleton></section>
        <section slot="panel" data-pane="dms"><flock-skeleton rows="4"></flock-skeleton></section>
        <section slot="panel" data-pane="flockchat" style="height: 70vh;"></section>
        <section slot="panel" data-pane="interactions"><flock-skeleton rows="6"></flock-skeleton></section>
      </flock-tabs>
    </section>
  `;
}

export function mount(root, ctx) {
  ensureVessels('the_chalice', 'the_seal', 'the_basin', 'the_mantle',
                'the_menorah', 'the_censer', 'the_signet', 'the_cup', 'the_rod', 'the_staff');

  const stops = [];
  const grab  = (k) => root.querySelector(`[data-pane="${k}"]`);

  stops.push(renderChannelsPane(grab('channels'),       ctx));
  stops.push(renderDmsPane(grab('dms'),                  ctx));
  stops.push(renderFlockchatPane(grab('flockchat'),      ctx));
  stops.push(renderInteractionsPane(grab('interactions'), ctx));

  return () => stops.forEach((fn) => { try { fn && fn(); } catch (_) {} });
}
