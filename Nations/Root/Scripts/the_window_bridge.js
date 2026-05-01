/* ══════════════════════════════════════════════════════════════════════════════
   THE WINDOW BRIDGE — Tabernacle global promoter
   "And Moses said unto them, Stand still, and I will hear what the LORD
    will command concerning you." — Numbers 9:8

   The Tabernacle backend scripts declare their globals as top-level `const`
   in classic (non-module) scripts. Those land in the shared global lexical
   scope and are accessible by bare name between scripts — but NOT via
   window['Name']. The New Covenant ES module bridge (the_legacy_bridge.js)
   polls window[globalName], so we must promote them.

   Load order: this script is <script defer> AFTER all Tabernacle scripts,
   so every const is already initialized when we run.
   ══════════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Map: window key → the lexical global name used in the Tabernacle scripts.
  // typeof is safe here — TDZ cannot apply across scripts, and typeof never
  // throws a ReferenceError for undeclared identifiers.
  var map = [
    // Auth / foundation
    ['Nehemiah',       typeof Nehemiah       !== 'undefined' ? Nehemiah       : null],
    // Communications (the_upper_room.js uses window.UpperRoom, bridge expects window.TheUpperRoom)
    ['TheUpperRoom',   typeof UpperRoom      !== 'undefined' ? UpperRoom      : null],
    // Membership
    ['TheShepherd',    typeof TheShepherd    !== 'undefined' ? TheShepherd    : null],
    ['TheFold',        typeof TheFold        !== 'undefined' ? TheFold        : null],
    ['TheScrolls',     typeof TheScrolls     !== 'undefined' ? TheScrolls     : null],
    // Pastoral / spiritual
    ['TheLife',        typeof TheLife        !== 'undefined' ? TheLife        : null],
    ['TheHarvest',     typeof TheHarvest     !== 'undefined' ? TheHarvest     : null],
    ['TheWay',         typeof TheWay         !== 'undefined' ? TheWay         : null],
    ['TheTruth',       typeof TheTruth       !== 'undefined' ? TheTruth       : null],
    ['TheSeason',      typeof TheSeason      !== 'undefined' ? TheSeason      : null],
    // Data / infra
    ['TheWellspring',  typeof TheWellspring  !== 'undefined' ? TheWellspring  : null],
    ['TheWell',        typeof TheWell        !== 'undefined' ? TheWell        : null],
    ['TheVine',        typeof TheVine        !== 'undefined' ? TheVine        : null],
    // Notifications
    ['Trumpet',        typeof Trumpet        !== 'undefined' ? Trumpet        : null],
  ];

  map.forEach(function (pair) {
    var key = pair[0], val = pair[1];
    if (val !== null && window[key] == null) {
      window[key] = val;
    }
  });

  if (typeof console !== 'undefined') {
    var loaded = map.filter(function (p) { return p[1] !== null; }).map(function (p) { return p[0]; });
    console.log('[NewCovenant] Window bridge promoted: ' + (loaded.join(', ') || '(none — backend scripts not loaded)'));
  }
})();
