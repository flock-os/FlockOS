/* ══════════════════════════════════════════════════════════════════════════════
   THE ARK — FlockOS Boot
   "And Noah did according unto all that the LORD commanded him." — Genesis 7:5

   The Ark carries the covenant through the redesign. This is the ONLY entry
   point for the new shell. It does three things and nothing else:

     1. Install a global error boundary (the_watchmen surfaces crashes calmly).
     2. Wake the chrome (the_veil), the router (the_scribes), the splash
        (the_lampstand), and the auth shell (the_priesthood) — in that order.
     3. Hand the reins to the_scribes for the first navigation.

   No views are imported here. No business logic lives here.
   Hard rule: this file stays under ~120 lines.
   ══════════════════════════════════════════════════════════════════════════════ */

import { kindle, darken } from './the_lampstand.js';
import { dress } from './the_veil/index.js';
import { register, go, current } from './the_scribes/index.js';
import { whoAmI, enter } from './the_priesthood/index.js';
import { report } from './the_watchmen.js';
import * as adornment from './the_adornment.js';
import * as livingWater from './the_living_water_register.js';

const flock = {
  /** Boot the new FlockOS shell. Idempotent. */
  async start() {
    if (flock._started) return;
    flock._started = true;

    adornment.init();       // theme tokens before any paint
    _installErrorBoundary();
    kindle();               // splash on

    // ── Auth gate — nothing renders until the user is signed in ──────────
    const user = await whoAmI();
    if (!user) {
      // Show login modal over the splash; block until signed in.
      // Cancel is disabled — the modal cannot be dismissed without signing in.
      darken(); // fade splash so the modal sits on a clean backdrop
      const result = await enter();
      if (!result.ok) {
        // Login failed without a session (shouldn't normally reach here).
        return;
      }
      kindle(); // splash back on while the shell boots
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── Pre-warm home data immediately after auth, in parallel with shell mount.
    //    GAS cold-start (~5s) runs while dress() + _registerViews() execute,
    //    so Manna has results (or in-flight dedups) when the home view mounts.
    //    We also hydrate Manna SYNCHRONOUSLY from Cistern *before* dress()
    //    runs, so the home view's first paint is instant.
    await _hydrateHomeFromCistern();
    _warmHomeData();

    // ── Pre-fetch home view modules in parallel with dress().
    //    The router lazy-loads views via dynamic import() which the browser
    //    cannot statically analyze. Kicking the import now means the module
    //    is compiled and in the cache by the time go() fires.
    _preloadViews();

    await dress();          // mount topbar / sidebar / main slot
    await _registerViews();

    // ── Wellspring guard — run in background, don't block first paint.
    _guardWellspring().catch(() => {});

    await go(_initialRoute(), { replace: true });
    darken();               // splash off (with fade via the_oil)
    livingWater.register().catch(() => {}); // SW after the first paint
  },

  _started: false,
  current: () => current(),
  theme: adornment,
};

/* ── View registration ────────────────────────────────────────────────────── */
async function _registerViews() {
  // Lazy view loaders — each view is its own folder with index.js.
  const V = (n) => () => import(`../views/${n}/index.js`);

  register('the_good_shepherd',          V('the_good_shepherd'),          { command: 'Go to: Home' });
  register('the_great_commission',       V('the_great_commission'),       { command: 'Go to: Missions' });
  register('the_invitation',             V('the_invitation'),             { command: 'Go to: Sign in' });
  register('the_pentecost',              V('the_pentecost'),              { command: 'Go to: Events' });
  register('the_wall',                   V('the_wall'),                   { command: 'Go to: Admin' });
  register('the_generations',            V('the_generations'),            { command: 'Go to: History' });
  register('the_anatomy_of_worship',     V('the_anatomy_of_worship'),     { command: 'Go to: Worship' });
  register('the_call_to_forgive',        V('the_call_to_forgive'),        { command: 'Go to: Reconciliation' });
  register('the_gift_drift',             V('the_gift_drift'),             { command: 'Go to: Giving' });
  register('the_weavers_plan',           V('the_weavers_plan'),           { command: 'Go to: Strategy' });
  register('prayerful_action',           V('prayerful_action'),           { command: 'Go to: Prayer journal' });
  register('quarterly_worship',          V('quarterly_worship'),          { command: 'Go to: Worship plan' });
  register('software_deployment_referral', V('software_deployment_referral'), { command: 'Go to: Deployment' });
  register('fishing_for_men',            V('fishing_for_men'),            { command: 'Go to: Outreach' });
  register('fishing_for_data',           V('fishing_for_data'),           { command: 'Go to: Analytics' });
  register('bezalel',                    V('bezalel'),                    { command: 'Go to: Bezalel codex' });
  register('about_flockos',              V('about_flockos'),              { command: 'About FlockOS' });
  register('learn_more',                 V('learn_more'),                 { command: 'Learn more' });

  // Comms views — three surfaces: GAS ledger, Firebase live, FlockChat embed.
  register('the_fellowship',           V('the_fellowship'),           { command: 'Go to: Fellowship' });
  register('the_announcements',        V('the_announcements'),        { command: 'Go to: Announcements' });
  register('the_prayer_chain',         V('the_prayer_chain'),         { command: 'Go to: Prayer chain' });

  // Care views
  register('the_fold',                 V('the_fold'),                 { command: 'Go to: The Fold' });
  register('the_life',                 V('the_life'),                 { command: 'Go to: Pastoral Care' });
  register('the_seasons',              V('the_seasons'),              { command: 'Go to: Seasons' });

  // Mission views
  register('the_harvest',              V('the_harvest'),              { command: 'Go to: Harvest' });
  register('the_way',                  V('the_way'),                  { command: 'Go to: The Way' });
  register('the_truth',                V('the_truth'),                { command: 'Go to: Content' });
}

/* ── Initial route ────────────────────────────────────────────────────────── */
function _initialRoute() {
  const params = new URLSearchParams(location.search);
  const v = params.get('view');
  return v && v.trim() ? v.trim() : 'the_good_shepherd';
}

/* ── View preload ─────────────────────────────────────────────────────────── */
function _preloadViews() {
  // Fire-and-forget: begin fetching+compiling the home view tree in the
  // background while dress() is running.  When go('the_good_shepherd') fires
  // the module is already in the browser's module registry — zero-latency.
  // _frame.js is shared by every view so it's cheap to preload once here.
  import('../views/_frame.js').catch(() => {});
  import('../views/the_good_shepherd/index.js').catch(() => {});
  // Sub-modules — without these the home view has to await each one after mount.
  import('../views/the_good_shepherd/the_count.js').catch(() => {});
  import('../views/the_good_shepherd/the_pasture.js').catch(() => {});
  import('../views/the_good_shepherd/the_today_events.js').catch(() => {});
  import('../views/the_good_shepherd/the_birthdays.js').catch(() => {});
  import('../views/the_good_shepherd/the_todos.js').catch(() => {});
  import('../views/the_good_shepherd/the_next_steps.js').catch(() => {});
  import('../views/the_good_shepherd/the_flock_feed.js').catch(() => {});
  import('../views/the_good_shepherd/the_call.js').catch(() => {});
}

/* ── Home data pre-warm ──────────────────────────────────────────────────── */

// All home dashboard data sources, in one place. Used by both the boot
// pre-warm AND the per-card SWR fetches so cache keys never drift.
const HOME_DATA_KEYS = [
  { key: 'shepherd:fellowship',    mod: './the_upper_room/index.js', fn: 'unreadTotal' },
  { key: 'shepherd:care',          mod: './the_life/index.js',       fn: 'pendingCount' },
  { key: 'shepherd:today',         mod: './the_seasons/index.js',    fn: 'todayCount' },
  { key: 'shepherd:next',          mod: './the_life/index.js',       fn: 'careCases' },
  { key: 'shepherd:feed',          mod: './the_comms.js',            fn: 'summary' },
  // New cards (added when the home dashboard was upgraded)
  { key: 'shepherd:members',       upperRoom: 'countMembers' },
  { key: 'shepherd:prayers',       upperRoom: 'countOpenPrayers' },
  { key: 'shepherd:today-events',  upperRoom: 'listEvents',  args: [{ limit: 80 }] },
  { key: 'shepherd:birthdays',     upperRoom: 'listMembers', args: [{ limit: 1000 }] },
  { key: 'shepherd:mytodos',       upperRoom: 'myTodos' },
];

/**
 * Synchronously hydrate Manna with the last-known values for every home
 * data source from Cistern. Runs BEFORE dress() so the first paint of the
 * home view shows real data instantly (then SWR refreshes in background).
 */
async function _hydrateHomeFromCistern() {
  try {
    const [{ hydrate }, { read }] = await Promise.all([
      import('./the_manna.js'),
      import('./the_cistern.js'),
    ]);
    const entries = await Promise.all(
      HOME_DATA_KEYS.map(async ({ key }) => {
        try { return [key, await read('manna:' + key)]; }
        catch (_) { return [key, undefined]; }
      })
    );
    const map = {};
    for (const [k, v] of entries) if (v !== undefined) map[k] = v;
    hydrate(map);
  } catch (_) { /* non-fatal */ }
}

async function _warmHomeData() {
  try {
    const [{ draw }, { write: cisternPut }] = await Promise.all([
      import('./the_manna.js'),
      import('./the_cistern.js'),
    ]);
    const TTL = 5 * 60_000; // 5 minutes — survive tab switches

    await Promise.all(HOME_DATA_KEYS.map(async (entry) => {
      try {
        let fetcher;
        if (entry.upperRoom) {
          fetcher = async () => {
            const UR = window.UpperRoom;
            if (!UR || !UR.isReady || !UR.isReady() || !UR[entry.upperRoom]) return null;
            return UR[entry.upperRoom](...(entry.args || []));
          };
        } else {
          const m = await import(entry.mod);
          fetcher = () => m[entry.fn]();
        }
        const value = await draw(entry.key, fetcher, { ttl: TTL });
        if (value !== undefined && value !== null) {
          cisternPut('manna:' + entry.key, value).catch(() => {});
        }
      } catch (_) { /* per-card failures are non-fatal */ }
    }));
  } catch (_) {}
}

/* ── Wellspring guard ─────────────────────────────────────────────────────── */
async function _guardWellspring() {
  const W = window.TheWellspring;
  if (!W || typeof W.status !== 'function') return;
  try {
    const s = await W.status();
    // If Wellspring is active but has no locally-imported data, kill it.
    // Without an Excel import, it returns empty arrays for every API call
    // and silently blocks all traffic to the live GAS backend.
    if (s.active && (!s.loaded || !s.totalRows)) {
      if (typeof W.disable === 'function') W.disable();
      console.info('[NewCovenant] TheWellspring disabled — no local data loaded. API calls will reach GAS.');
    }
  } catch (_) { /* non-fatal */ }
}

/* ── Error boundary (light-touch — the_watchmen does the work) ───────────── */
function _installErrorBoundary() {
  window.addEventListener('error', (e) => report(e.error || e.message, 'window.error'));
  window.addEventListener('unhandledrejection', (e) =>
    report(e.reason, 'unhandledrejection')
  );
}

/* ── Globals ──────────────────────────────────────────────────────────────── */
globalThis.flock = flock;

/* ── Auto-start when ?covenant=new is present, else stay silent ───────────── */
const _qs = new URLSearchParams(location.search);
if (_qs.get('covenant') === 'new') {
  // Wait for DOMContentLoaded — guarantees all `defer` backend scripts
  // (firm_foundation.js, the_true_vine.js, the_window_bridge.js, etc.)
  // have fully executed before we touch window.Nehemiah or window.TheVine.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => flock.start());
  } else {
    // Already past DOMContentLoaded (e.g. dynamic load) — start immediately.
    flock.start();
  }
}

export { flock };
