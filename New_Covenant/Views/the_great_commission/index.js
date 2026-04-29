/* ══════════════════════════════════════════════════════════════════════════════
   VIEW: THE GREAT COMMISSION — Missions
   "Go ye therefore, and teach all nations." — Matthew 28:19

   Live Firestore data sources:
     • missionsRegistry     — global top-level collection (~95 country dossiers
                              seeded from Joshua Project + Bible Access List)
     • missionsPrayerFocus  — church-scoped prayer needs
     • missionsTeams        — church-scoped mission trips / long-term workers
     • missionsPartners     — church-scoped sending agencies & field partners
     • missionsUpdates      — church-scoped field situation reports
   ══════════════════════════════════════════════════════════════════════════════ */

import { pageHero } from '../_frame.js';

export const name  = 'the_great_commission';
export const title = 'The Great Commission';

// ── HTML escaping ──────────────────────────────────────────────────────────────
function _e(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Normalize API response → plain array ───────────────────────────────────────
function _normalize(raw) {
  if (Array.isArray(raw))                  return raw;
  if (raw && Array.isArray(raw.data))      return raw.data;
  if (raw && Array.isArray(raw.rows))      return raw.rows;
  return [];
}

// ── Missions data adapter (Firestore-first, GAS-fallback) ─────────────────────
// Topology rule: when window.UpperRoom is initialized (Firestore mode), all
// reads/writes go directly to Firestore. The Cloud Function trigger then POSTs
// `sync.write` to GAS, which mirrors the row into the Sheet via the handler in
// N-Master SyncHandler.md. When UpperRoom is NOT ready (legacy GAS-only deploy),
// the adapter transparently falls back to the TheVine GAS missions routes.
// This keeps the GAS contract intact — DO NOT remove the GAS handlers from
// L-Master Code.md; they remain authoritative for GAS-only deployments and for
// the email/auth side-effects that GAS still owns.
// ──────────────────────────────────────────────────────────────────────────────
function _buildMissionsAdapter(V) {
  const UR = (typeof window !== 'undefined') ? window.UpperRoom : null;
  const fsReady = () => !!(UR && typeof UR.isReady === 'function' && UR.isReady());

  function _wrap(gasNs, urSuffix) {
    const gas = V?.missions?.[gasNs] || {};
    const urList   = UR && UR['listMissions'   + urSuffix];
    const urGet    = UR && UR['getMissions'    + urSuffix];
    const urCreate = UR && UR['createMissions' + urSuffix];
    const urUpdate = UR && UR['updateMissions' + urSuffix];
    const urDelete = UR && UR['deleteMissions' + urSuffix];
    return {
      list:   (p) => (fsReady() && urList)   ? urList(p || {})   : (gas.list   ? gas.list(p)   : Promise.resolve([])),
      get:    (p) => (fsReady() && urGet)    ? urGet(p)          : (gas.get    ? gas.get(p)    : Promise.reject(new Error('get not supported'))),
      create: (p) => (fsReady() && urCreate) ? urCreate(p)       : gas.create(p),
      update: (p) => (fsReady() && urUpdate) ? urUpdate(p)       : gas.update(p),
      delete: (p) => (fsReady() && urDelete) ? urDelete(p)       : gas.delete(p),
    };
  }

  const prayer = _wrap('prayerFocus', 'PrayerFocus');
  prayer.respond = (p) => {
    if (fsReady() && UR.respondMissionsPrayerFocus) return UR.respondMissionsPrayerFocus(p);
    const pf = V?.missions?.prayerFocus;
    return (pf?.respond) ? pf.respond(p) : Promise.resolve(null);
  };

  return {
    isFirestore: fsReady,
    registry:    _wrap('registry',  'Registry'),
    teams:       _wrap('teams',     'Teams'),
    partners:    _wrap('partners',  'Partners'),
    updates:     _wrap('updates',   'Updates'),
    prayerFocus: prayer,
  };
}

// ── Joshua Project API helpers ────────────────────────────────────────────────
const _JP_BASE = 'https://api.joshuaproject.net/v1';

async function _getJpApiKey() {
  try {
    const UR = window.UpperRoom;
    if (!UR || typeof UR.getAppConfig !== 'function') return '';
    const cfg = await UR.getAppConfig({ key: 'jp_api_key' });
    return cfg?.value || '';
  } catch (_) { return ''; }
}

function _isoToFlag(iso2) {
  if (!iso2 || iso2.length !== 2) return '🌍';
  return String.fromCodePoint(...[...iso2.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)));
}

// Joshua Project's ROG3 field is the FIPS 10-4 country code, NOT ISO 3166-1
// alpha-2. They match for most countries but diverge for ~30 (e.g., FIPS TX
// vs. ISO TM for Turkmenistan), which breaks the Regional Indicator flag
// emoji. Prefer JP's ISO2 field; fall back to a FIPS→ISO patch table; last
// resort is the raw ROG3 (which will still render letters-in-boxes if invalid,
// matching pre-fix behavior).
const _FIPS_TO_ISO2 = {
  AG: 'DZ', AJ: 'AZ', BA: 'BH', BC: 'BW', BF: 'BS', BH: 'BZ', BK: 'BA',
  BM: 'MM', BO: 'BY', BP: 'SB', BU: 'BG', BX: 'BN', BY: 'BI', CB: 'KH',
  CD: 'TD', CE: 'LK', CF: 'CG', CG: 'CD', CH: 'CN', CI: 'CL', CJ: 'KY',
  CK: 'KH', CS: 'CR', CT: 'CF', CU: 'CU', DA: 'DK', DJ: 'DJ', DO: 'DM',
  EI: 'IE', EK: 'GQ', ER: 'ER', ES: 'SV', ET: 'ET', EZ: 'CZ', FJ: 'FJ',
  FM: 'FM', FP: 'PF', GA: 'GM', GB: 'GA', GG: 'GE', GJ: 'GD', GL: 'GL',
  GM: 'DE', GR: 'GR', GT: 'GT', GV: 'GN', HA: 'HT', HO: 'HN', HR: 'HR',
  IC: 'IS', IN: 'IN', IZ: 'IQ', JA: 'JP', KE: 'KE', KN: 'KP', KS: 'KR',
  KU: 'KW', KZ: 'KZ', LE: 'LB', LG: 'LV', LH: 'LT', LO: 'SK', LS: 'LI',
  LT: 'LS', LY: 'LY', MA: 'MG', MC: 'MO', MG: 'MN', MH: 'MS', MI: 'MW',
  MJ: 'ME', MK: 'MK', MO: 'MA', MP: 'MU', MR: 'MR', MV: 'MD', MX: 'MX',
  MY: 'MY', NH: 'VU', NI: 'NG', NL: 'NL', NS: 'SR', NU: 'NI', NZ: 'NZ',
  PA: 'PY', PK: 'PK', PM: 'PA', PO: 'PT', PP: 'PG', PU: 'GW', RB: 'RS',
  RM: 'MH', RP: 'PH', RQ: 'PR', RS: 'RU', SA: 'SA', SF: 'ZA', SG: 'SN',
  SI: 'SI', SL: 'SL', SP: 'ES', SU: 'SD', SW: 'SE', SY: 'SY', SZ: 'CH',
  TI: 'TJ', TO: 'TG', TS: 'TN', TU: 'TR', TX: 'TM', UG: 'UG', UK: 'GB',
  UP: 'UA', UV: 'BF', UY: 'UY', UZ: 'UZ', VE: 'VE', VM: 'VN', WA: 'NA',
  WI: 'EH', WZ: 'SZ', YM: 'YE', ZA: 'ZM', ZI: 'ZW',
};
function _jpIso2(c) {
  const iso2 = (c.ISO2 || '').trim().toUpperCase();
  if (iso2.length === 2) return iso2;
  const rog3 = (c.ROG3 || '').trim().toUpperCase();
  return _FIPS_TO_ISO2[rog3] || rog3;
}

function _jpScaleToAccess(scale) {
  const s = parseInt(scale, 10);
  if (s === 1) return 'Unreached';
  if (s === 2) return 'Limited';
  if (s === 3 || s === 4) return 'Partial';
  if (s >= 5) return 'Open';
  return '';
}

// JP doesn't publish Open Doors WWL data directly, but it does expose
// `RLG3` (primary religion code) + `JPScale` which together approximate the
// gospel-restriction climate well enough to drive a persecution badge for
// every imported country. This keeps cards visually consistent until a real
// WWL feed is wired in. A country with an explicit WWL/restrictionsRank set
// elsewhere will always override this in `_countryCard`.
function _jpDerivePersecution(c) {
  const scale = parseInt(c.JPScale, 10);
  const rel   = String(c.PrimaryReligion || '').toLowerCase();
  const pctEv = parseFloat(c.PercentEvangelical || c.PercentEvangelicalPC || 0);
  // JPScale 1 = Unreached. Combined with restrictive religious context →
  // generally Severe to Extreme. Christian-majority unreached pockets are
  // rare; treat them as Moderate.
  if (scale === 1) {
    if (rel.includes('islam') || rel.includes('hindu') || rel.includes('buddh')) {
      return pctEv < 0.5 ? 'Extreme' : 'Severe';
    }
    if (rel.includes('non-religious') || rel.includes('ethnic')) return 'High';
    return 'Moderate';
  }
  if (scale === 2) return 'High';
  if (scale === 3) return 'Considerable';
  if (scale === 4) return 'Moderate';
  if (scale >= 5) return 'Low';
  return '';
}

function _jpMapCountry(c) {
  const iso2 = _jpIso2(c);
  const obj = {
    countryName:      c.Ctry || '',
    isoCode:          iso2,
    continent:        c.Continent || '',
    region:           c.RegionName || '',
    dominantReligion: c.PrimaryReligion || '',
    gospelAccess:     _jpScaleToAccess(c.JPScale) || 'Limited',
    persecutionLevel: _jpDerivePersecution(c),
    tenFortyWindow:   c.Window1040 === 'Y' || c.Window1040 === true,
    profileUrl:       c.CountryURL || (iso2 ? `https://joshuaproject.net/countries/${iso2}` : ''),
    icon:             iso2 ? _isoToFlag(iso2) : '🌍',
    jpUpdatedAt:      new Date().toISOString().slice(0, 10),
  };
  if (c.Population != null)            obj.population         = Number(c.Population);
  if (c.PopulationUnreached != null)   obj.populationUnreached = Number(c.PopulationUnreached);
  if (c.PercentChristianPC != null)    obj.christianPercent   = parseFloat(c.PercentChristianPC);
  if (c.PercentEvangelical != null)    obj.evangelicalPercent = parseFloat(c.PercentEvangelical);
  else if (c.PercentEvangelicalPC != null) obj.evangelicalPercent = parseFloat(c.PercentEvangelicalPC);
  if (c.PeopleGroups != null)          obj.peopleGroups       = Number(c.PeopleGroups);
  if (c.LeastReached != null)          obj.unreachedGroups    = Number(c.LeastReached);
  else if (c.PeopleGroupsLR != null)   obj.unreachedGroups    = Number(c.PeopleGroupsLR);
  if (c.PrimaryLanguageName)           obj.primaryLanguage    = String(c.PrimaryLanguageName);
  if (c.BibleStatus != null)           obj.bibleStatus        = String(c.BibleStatus);
  if (c.PercentUrbanized != null)      obj.urbanizedPercent   = parseFloat(c.PercentUrbanized);
  if (c.LiteracyRate != null)          obj.literacyRate       = parseFloat(c.LiteracyRate);
  return obj;
}

async function _fetchUnreachedOfDay(apiKey) {
  const res = await fetch(`${_JP_BASE}/people_groups/daily_unreached.json?api_key=${encodeURIComponent(apiKey)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return Array.isArray(data) && data.length ? data[0] : null;
}

function _unreachedOfDayCard(g) {
  if (!g) return '';
  const pct     = g.PercentEvangelical != null ? parseFloat(g.PercentEvangelical).toFixed(2) + '%' : '—';
  const pop     = g.Population ? Number(g.Population).toLocaleString() : '—';
  const lang    = _e(g.PrimaryLanguageName || '—');
  const rel     = _e(g.PrimaryReligion || '—');
  const url     = _e(g.PeopleGroupURL || 'https://joshuaproject.net');
  const photo   = _e(g.PeopleGroupPhotoURL || '');
  const name    = _e(g.PeopNameInCountry || g.PeopNameAcrossCountries || 'Unknown People Group');
  const ctry    = _e(g.Ctry || '');
  const raw     = String(g.Summary || '');
  const summary = raw ? _e(raw.length > 280 ? raw.slice(0, 280) + '…' : raw) : '';
  return `<div class="gc-uotd">
    <div class="gc-uotd-header">
      <span class="gc-uotd-label">🕊 Unreached of the Day</span>
      ${ctry ? `<span class="gc-uotd-country">${ctry}</span>` : ''}
    </div>
    <div class="gc-uotd-body">
      ${photo ? `<img class="gc-uotd-photo" src="${photo}" alt="${name}" loading="lazy">` : ''}
      <div class="gc-uotd-info">
        <div class="gc-uotd-name">${name}</div>
        <div class="gc-uotd-meta">
          <span>👥 ${pop}</span>
          <span>🗣 ${lang}</span>
          <span>🕌 ${rel}</span>
          <span>✝️ ${pct} evangelical</span>
        </div>
        ${summary ? `<p class="gc-uotd-summary">${summary}</p>` : ''}
        <a class="gc-uotd-link" href="${url}" target="_blank" rel="noopener noreferrer">View profile on Joshua Project ↗</a>
      </div>
    </div>
  </div>`;
}

// ── Tab definitions ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'world',     icon: '🌍', label: 'World'     },
  { id: 'prayer',    icon: '🙏', label: 'Prayer'    },
  { id: 'teams',     icon: '✈️',  label: 'Teams'     },
  { id: 'partners',  icon: '🤝', label: 'Partners'  },
  { id: 'updates',   icon: '📡', label: 'Updates'   },
  { id: 'resources', icon: '🌐', label: 'Resources' },
];

// ── Persecution level → badge ──────────────────────────────────────────────────
function _persLevel(level) {
  const l = String(level || '').toLowerCase();
  const map = {
    extreme:      { bg: '#7f1d1d', fg: '#fca5a5', label: 'Extreme'      },
    'very high':  { bg: '#7c2d12', fg: '#fdba74', label: 'Very High'    },
    severe:       { bg: '#7c2d12', fg: '#fdba74', label: 'Severe'       },
    high:         { bg: '#713f12', fg: '#fde68a', label: 'High'         },
    considerable: { bg: '#713f12', fg: '#fde68a', label: 'Considerable' },
    moderate:     { bg: '#365314', fg: '#bbf7d0', label: 'Moderate'     },
    some:         { bg: '#365314', fg: '#bbf7d0', label: 'Some'         },
    minimal:      { bg: '#1e3a2f', fg: '#6ee7b7', label: 'Minimal'      },
    low:          { bg: '#1e3a2f', fg: '#6ee7b7', label: 'Low'          },
  };
  const s = map[l] || { bg: 'var(--bg-sunken,#f0f0f5)', fg: 'var(--ink-muted,#7a7f96)', label: level || '—' };
  return `<span class="gc-pers-badge" style="background:${s.bg};color:${s.fg};">${_e(s.label)}</span>`;
}

// ── Gospel access → badge ──────────────────────────────────────────────────────
function _gospelAccess(g) {
  const k = String(g || '').toLowerCase();
  const map = {
    unreached:  { bg: '#7f1d1d', fg: '#fca5a5' },
    limited:    { bg: '#78350f', fg: '#fde68a' },
    restricted: { bg: '#1e3a5f', fg: '#93c5fd' },
    partial:    { bg: '#2d3748', fg: '#a0aec0' },
    open:       { bg: '#14532d', fg: '#86efac' },
  };
  const s = map[k] || { bg: 'var(--bg-sunken,#f0f0f5)', fg: 'var(--ink-muted,#7a7f96)' };
  return `<span class="gc-access-badge" style="background:${s.bg};color:${s.fg};">${_e(g || '—')}</span>`;
}

// ── KPI stat card ──────────────────────────────────────────────────────────────
function _kpiCard(label, val, color) {
  return `<div class="gc-kpi-card">
    <div class="gc-kpi-n" style="color:${color};">${_e(String(val))}</div>
    <div class="gc-kpi-label">${_e(label)}</div>
  </div>`;
}

// ── Country card (grid tile) ───────────────────────────────────────────────────
function _countryCard(r) {
  const cname  = r.countryName || r.name || '';
  // Heal flag emoji at render time: older imports stored JP's FIPS code
  // (ROG3) as `isoCode`, which produces letters-in-boxes for ~30 countries.
  // Recompute from a valid ISO 3166-1 alpha-2 when possible.
  const isoRaw = String(r.isoCode || '').trim().toUpperCase();
  const isoFix = _FIPS_TO_ISO2[isoRaw] || isoRaw;
  const flag   = (isoFix.length === 2)
    ? _isoToFlag(isoFix)
    : (r.icon || '🌍');
  // Rank pill: prefer WWL rank (1–100+), then Bible restrictions rank; skip when 0
  const rankNum = r.restrictionsRank   > 0 ? r.restrictionsRank
                : r.worldWatchListRank > 0 ? r.worldWatchListRank
                : null;
  const pers   = r.persecutionLevel || r.persecution || '';
  const acc    = r.gospelAccess || r.access || '';
  const is1040 = r.tenFortyWindow === true
              || String(r.tenFortyWindow  || '').toLowerCase() === 'yes'
              || r['10/40Window'] === true
              || String(r['10/40Window']  || '').toLowerCase() === 'yes';
  const pop          = r.population         ? Number(r.population).toLocaleString()          : null;
  const popUnreached = r.populationUnreached ? Number(r.populationUnreached).toLocaleString() : null;
  const wwl          = r.worldWatchListRank  != null ? r.worldWatchListRank                   : null;
  const ungroups     = r.unreachedGroups     != null ? r.unreachedGroups                      : null;
  const pctChrist    = r.christianPercent    != null
    ? (r.christianPercent < 1 ? r.christianPercent.toFixed(2) : r.christianPercent.toFixed(1)) + '%'
    : null;
  const footerMeta = [r.continent, r.dominantReligion].filter(Boolean).join(' · ');

  return `
    <article class="gc-country-card"
      tabindex="0" role="button"
      data-country="${_e(cname.toLowerCase())}"
      data-persecution="${_e(String(pers).toLowerCase())}"
      data-access="${_e(String(acc).toLowerCase())}"
      data-1040="${is1040 ? 'yes' : 'no'}">
      <div class="gc-card-top">
        <span class="gc-flag">${_e(flag)}</span>
        ${rankNum !== null ? `<span class="gc-rank-pill">#${_e(String(rankNum))}</span>` : ''}
        ${_canEditRegistry
          ? `<button class="gc-edit-btn" data-edit-id="${_e(r.id || '')}" aria-label="Edit country" title="Edit">✏️</button>`
          : ''}
      </div>
      <div class="gc-country-name">${_e(cname)}</div>
      <div class="gc-badges">
        ${pers ? _persLevel(pers) : ''}
        ${acc ? _gospelAccess(acc) : ''}
        ${is1040 ? '<span class="gc-1040-badge">10/40</span>' : ''}
      </div>
      ${footerMeta ? `<div class="gc-country-meta">${_e(footerMeta)}</div>` : ''}
      <div class="gc-country-expand">
        <div class="gc-country-detail">
          ${r.region           ? `<span>📍 ${_e(r.region)}</span>`                              : ''}
          ${pop                ? `<span>👥 ${pop}</span>`                                        : ''}
          ${pctChrist          ? `<span>✝️ ${pctChrist} Christian</span>`                        : ''}
          ${r.evangelicalPercent != null ? `<span>🕊️ ${(r.evangelicalPercent < 1 ? r.evangelicalPercent.toFixed(2) : r.evangelicalPercent.toFixed(1))}% Evangelical</span>` : ''}
          ${wwl    != null     ? `<span>📋 WWL #${_e(String(wwl))}</span>`                       : ''}
          ${ungroups != null   ? `<span>🔴 ${_e(String(ungroups))} unreached groups</span>`     : ''}
          ${r.peopleGroups != null && ungroups == null ? `<span>👥 ${_e(String(r.peopleGroups))} people groups</span>` : ''}
          ${popUnreached       ? `<span>📍 ${popUnreached} in unreached pop.</span>`             : ''}
          ${r.primaryLanguage  ? `<span>🗣️ ${_e(r.primaryLanguage)}</span>`                     : ''}
          ${r.bibleStatus      ? `<span>📖 Bible: ${_e(r.bibleStatus)}</span>`                  : ''}
          ${r.bibleShortageNeed       ? `<span>📖 Bible need: ${_e(r.bibleShortageNeed)}</span>`                  : ''}
          ${r.restrictionsRank != null ? `<span>📖 Bible Access Rank #${_e(String(r.restrictionsRank))}</span>` : ''}
          ${r.notes                   ? `<span>📝 ${_e(String(r.notes).substring(0, 160))}</span>`              : ''}
        </div>
        ${r.profileUrl
          ? `<a class="gc-profile-link" href="${_e(r.profileUrl)}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">View Profile ↗</a>`
          : ''}
      </div>
    </article>`;
}

// ── Prayer focus card ──────────────────────────────────────────────────────────
function _prayerCard(r) {
  const priRaw = String(r.priority || r.Priority || 'normal').toLowerCase();
  const priMap = {
    urgent: { label: 'Urgent', color: '#ef4444', bg: 'rgba(239,68,68,0.08)',      border: '#ef4444',             icon: '🚨' },
    high:   { label: 'High',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',     border: '#f59e0b',             icon: '🔴' },
    normal: { label: 'Normal', color: 'var(--accent,#5b8fcf)', bg: 'rgba(91,143,207,0.06)', border: 'var(--accent,#5b8fcf)', icon: '🙏' },
  };
  const pri   = priMap[priRaw] || priMap.normal;
  const count = r.responsesCount || r.prayerCount || 0;

  // Parse prayer points — handle newline-separated string or array
  const rawPts = Array.isArray(r.prayerPoints)
    ? r.prayerPoints
    : (r.prayerPoints ? String(r.prayerPoints).split('\n').filter(Boolean) : []);
  const pts = rawPts.flatMap(line => {
    const parts = line.split(/(?=\d+\.\s)/).filter(Boolean);
    return parts.length > 1
      ? parts.map(p => p.replace(/^\d+\.\s*/, '').trim()).filter(Boolean)
      : [line.replace(/^\d+\.\s*/, '').trim()].filter(Boolean);
  });

  return `
    <div class="gc-prayer-card" style="border-left-color:${pri.border};" data-id="${_e(r.id || '')}">
      <div class="gc-prayer-hd">
        <div class="gc-prayer-icon" style="background:${pri.bg};">${pri.icon}</div>
        <div class="gc-prayer-hd-body">
          <div class="gc-prayer-title">${_e(r.title || r.Title || 'Prayer Need')}</div>
          <div class="gc-prayer-meta">
            ${r.country || r.countryId ? `<span>📍 ${_e(r.country || r.countryId)}</span>` : ''}
            ${r.peopleGroup             ? `<span>👥 ${_e(r.peopleGroup)}</span>`             : ''}
            <span class="gc-pri-badge" style="color:${pri.color};border-color:${pri.border};">${_e(pri.label)}</span>
            ${count ? `<span class="gc-prayer-count">🙏 ${_e(String(count))} praying</span>` : ''}
          </div>
        </div>
        <span class="gc-prayer-chevron">▾</span>
      </div>
      <div class="gc-prayer-body">
        ${r.description || r.Description ? `
          <div class="gc-prayer-section">
            <div class="gc-prayer-section-lbl">💡 Background</div>
            <p>${_e(r.description || r.Description)}</p>
          </div>` : ''}
        ${r.scripture || r.Scripture ? `
          <div class="gc-prayer-section gc-prayer-section--scripture">
            <div class="gc-prayer-section-lbl">📖 Scripture</div>
            <p>${_e(r.scripture || r.Scripture)}</p>
          </div>` : ''}
        ${pts.length ? `
          <div class="gc-prayer-section gc-prayer-section--pts">
            <div class="gc-prayer-section-lbl">🙏 Prayer Points</div>
            <ul class="gc-prayer-pts">${pts.map(pt => `<li>${_e(pt)}</li>`).join('')}</ul>
          </div>` : ''}
        ${r.startDate || r.endDate ? `
          <div class="gc-prayer-dates">🗓
            ${r.startDate ? _e(String(r.startDate).substring(0, 10)) : ''}
            ${r.endDate   ? ' → ' + _e(String(r.endDate).substring(0, 10)) : ''}
          </div>` : ''}
        <div class="gc-prayer-foot">
          <button class="gc-pray-btn" data-id="${_e(r.id || '')}">🙏 I Prayed</button>
          <button class="gc-edit-prayer-btn" data-prayer-edit="${_e(r.id || '')}" style="margin-left:auto;background:none;border:1px solid var(--line,#e5e7ef);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;color:var(--ink-muted,#7a7f96);" title="Edit prayer need">✏️ Edit</button>
        </div>
      </div>
    </div>`;
}

// ── Mission team card ──────────────────────────────────────────────────────────
function _teamCard(r) {
  const statusColors = {
    'on field':    'var(--success,#22c55e)',
    'ready':       'var(--accent,#5b8fcf)',
    'fundraising': '#f59e0b',
    'planning':    'var(--ink-muted,#7a7f96)',
    'completed':   'var(--line,#e5e7ef)',
    'cancelled':   'var(--danger,#dc2626)',
  };
  const status = r.tripStatus || r.status || '';
  const sc     = statusColors[status.toLowerCase()] || 'var(--ink-muted,#7a7f96)';
  const raised = parseFloat(r.raised || 0);
  const budget = parseFloat(r.budget || 0);
  const pct    = budget > 0 ? Math.min(100, Math.round((raised / budget) * 100)) : 0;

  return `
    <div class="gc-team-card" data-id="${_e(String(r.id || ''))}" tabindex="0" style="cursor:pointer">
      <div class="gc-team-top">
        <div>
          <div class="gc-team-name">${_e(r.teamName || r.name || 'Unnamed Team')}</div>
          <div class="gc-team-meta">📍 ${_e(r.countryId || r.country || 'Unspecified')} · ${_e(r.tripType || '')}</div>
        </div>
        <span class="gc-team-status" style="color:${sc};">${_e(status || '—')}</span>
      </div>
      ${r.startDate ? `<div class="gc-team-dates">🗓 ${_e(String(r.startDate).substring(0, 10))}${r.endDate ? ' → ' + _e(String(r.endDate).substring(0, 10)) : ''}</div>` : ''}
      ${budget > 0 ? `
        <div class="gc-fund-row">
          <span>Fundraising</span>
          <span>${pct}% · $${raised.toLocaleString()} of $${budget.toLocaleString()}</span>
        </div>
        <div class="gc-fund-bar"><div class="gc-fund-fill" style="width:${pct}%;"></div></div>` : ''}
      <div class="gc-team-members">👥 ${_e(String(r.memberCount || r.teamMembers || 0))} members · Lead: ${_e(r.teamLeadName || r.leadName || '—')}</div>
      ${r.notes ? `<div class="gc-team-notes" style="font-size:0.78rem;color:var(--ink-muted,#7a7f96);margin-top:6px;padding-top:6px;border-top:1px solid var(--line,#e5e7ef);">📝 ${_e(String(r.notes).substring(0,160))}</div>` : ''}
    </div>`;
}

// ── Mission partner card ───────────────────────────────────────────────────────
function _partnerCard(r) {
  const typeIcons = {
    'sending agency': '🚀', 'field team': '🏕', 'translation': '📖',
    'media': '📡', 'humanitarian': '❤️', 'church network': '⛪',
  };
  const icon   = typeIcons[String(r.partnerType || r.type || '').toLowerCase()] || '🤝';
  const status = r.relationshipStatus || r.status || '';

  return `
    <div class="gc-partner-card" data-id="${_e(String(r.id || ''))}" tabindex="0" style="cursor:pointer">
      <div class="gc-partner-top">
        <span class="gc-partner-icon">${icon}</span>
        <div class="gc-partner-info">
          <div class="gc-partner-name">${_e(r.organizationName || r.name || '')}</div>
          <div class="gc-partner-meta">${_e(r.partnerType || r.type || '')}${r.focusArea ? ' · ' + _e(r.focusArea) : ''}</div>
        </div>
        ${status ? `<span class="gc-partner-status">${_e(status)}</span>` : ''}
      </div>
      ${r.description ? `<p class="gc-partner-desc">${_e(String(r.description).substring(0, 160))}</p>` : ''}
      <div class="gc-partner-footer">
        ${r.workersCount ? `<span>👥 ${_e(String(r.workersCount))} workers</span>` : ''}
        ${r.website ? `<a class="gc-profile-link" href="${_e(r.website)}" target="_blank" rel="noopener noreferrer">🔗 Website</a>` : ''}
      </div>
      ${r.notes ? `<div style="font-size:0.78rem;color:var(--ink-muted,#7a7f96);margin-top:6px;">📝 ${_e(String(r.notes).substring(0,160))}</div>` : ''}
    </div>`;
}

// ── Field update card ──────────────────────────────────────────────────────────
function _updateCard(r) {
  const sevColor = {
    Critical:      'var(--danger,#dc2626)',
    High:          '#f59e0b',
    Moderate:      'var(--info,#38bdf8)',
    Informational: 'var(--line,#e5e7ef)',
  };
  const c    = sevColor[r.severity || r.Severity] || 'var(--line,#e5e7ef)';
  const typeIcons = {
    'Prayer Alert': '🙏', 'Situation Report': '📋',
    'Victory Report': '🎉', 'Breaking': '⚡', 'Analysis': '📊',
  };
  const icon = typeIcons[r.updateType || r.UpdateType || r.type] || '📰';
  const body = (r.body || r.Body || r.description || '').substring(0, 220);

  return `
    <div class="gc-update-card" data-id="${_e(String(r.id || ''))}" style="border-left-color:${c};cursor:pointer;">
      <span class="gc-update-icon">${icon}</span>
      <div class="gc-update-content">
        <div class="gc-update-title">${_e(r.title || r.Title || '')}</div>
        ${r.updateType || r.UpdateType || r.type
          ? `<span class="gc-update-type">${_e(r.updateType || r.UpdateType || r.type)}</span>`
          : ''}
        ${body ? `<p class="gc-update-body">${_e(body)}</p>` : ''}
        <div class="gc-update-meta">
          ${r.country || r.countryId ? `<span>📍 ${_e(r.country || r.countryId)}</span>`        : ''}
          ${r.source                 ? `<span>📡 ${_e(r.source)}</span>`                         : ''}
          ${r.createdAt              ? `<span>🕒 ${_e(String(r.createdAt).substring(0, 10))}</span>` : ''}
          ${r.notes                  ? `<span>📝 ${_e(String(r.notes).substring(0,100))}</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ── Resources panel ────────────────────────────────────────────────────────────
function _resourcesPanel() {
  const links = [
    { icon: '🔓', label: 'Open Doors USA',      desc: 'World Watch List · Persecution data',          href: 'https://www.opendoorsusa.org'    },
    { icon: '🗺', label: 'Joshua Project',       desc: 'Unreached people groups · Country profiles',  href: 'https://joshuaproject.net'        },
    { icon: '✝️', label: 'Voice of the Martyrs', desc: 'Persecuted church news & prayer',             href: 'https://www.persecution.com'      },
    { icon: '🌏', label: 'Operation World',      desc: 'Country-by-country prayer guide',             href: 'https://operationworld.org'       },
    { icon: '🏁', label: 'Finishing the Task',   desc: 'Zero UPG movement coordination',              href: 'https://finishingthetask.com'     },
    { icon: '📖', label: 'Bible Access List',    desc: 'Scripture access restrictions by country',    href: 'https://www.bibleaccesslist.org'  },
  ];
  return `
    <div class="gc-resources">
      <h2 class="gc-resources-title">Missions Resources</h2>
      <p class="gc-resources-sub">Trusted organizations and data sources for global engagement.</p>
      <div class="gc-resources-grid">
        ${links.map(l => `
          <a class="gc-resource-card" href="${_e(l.href)}" target="_blank" rel="noopener noreferrer">
            <span class="gc-resource-icon">${l.icon}</span>
            <div>
              <div class="gc-resource-name">${_e(l.label)}</div>
              <div class="gc-resource-desc">${_e(l.desc)}</div>
            </div>
          </a>`).join('')}
      </div>
    </div>`;
}

// ── Render shell ───────────────────────────────────────────────────────────────
export function render() {
  const tabs = TABS.map((t, i) => `
    <button class="gc-tab${i === 0 ? ' is-active' : ''}" data-tab="${_e(t.id)}">
      <span>${t.icon}</span> ${_e(t.label)}
    </button>`).join('');

  return /* html */`
    <section class="gc-view">
      ${pageHero({
        title:    'The Great Commission',
        subtitle: 'Country dossiers, persecution intel, prayer focus, mission teams, and field partners.',
        scripture: '"Go ye therefore, and teach all nations." — Matthew 28:19',
      })}

      <nav class="gc-tabs" role="tablist">${tabs}</nav>

      <div class="gc-kpi-row" id="gc-kpi">
        ${_kpiCard('Countries Tracked',   '—', 'var(--accent,#5b8fcf)')}
        ${_kpiCard('Extreme Persecution', '—', 'var(--danger,#dc2626)')}
        ${_kpiCard('Unreached Gospel',    '—', '#f59e0b')}
        ${_kpiCard('10/40 Window',        '—', '#818cf8')}
      </div>

      <div id="gc-action-bar" class="gc-action-bar" style="display:none;"></div>

      <div class="gc-filter-bar" id="gc-filters">
        <input  class="gc-search" id="gc-search" type="search"
                placeholder="Search countries…" aria-label="Search countries">
        <select class="gc-select" id="gc-pers-filter" aria-label="Filter by persecution level">
          <option value="">All Persecution Levels</option>
          <option value="extreme">Extreme</option>
          <option value="severe">Severe</option>
          <option value="very high">Very High</option>
          <option value="high">High</option>
          <option value="considerable">Considerable</option>
          <option value="moderate">Moderate</option>
          <option value="some">Some</option>
          <option value="minimal">Minimal</option>
          <option value="low">Low</option>
        </select>
        <select class="gc-select" id="gc-access-filter" aria-label="Filter by gospel access">
          <option value="">All Gospel Access</option>
          <option value="unreached">Unreached</option>
          <option value="limited">Limited</option>
          <option value="restricted">Restricted</option>
          <option value="partial">Partial</option>
          <option value="open">Open</option>
        </select>
        <label class="gc-1040-toggle">
          <input type="checkbox" id="gc-1040-filter"> 10/40 Window only
        </label>
      </div>

      <div id="gc-content" class="gc-content">
        <div class="gc-loading">Loading…</div>
      </div>
    </section>`;
}

// ── Mount ──────────────────────────────────────────────────────────────────────
export function mount(root) {
  let _activeTab = 'world';
  const V = window.TheVine;
  // Firestore-first adapter (falls back to GAS when UpperRoom not ready).
  // See _buildMissionsAdapter doc-block for the topology rule.
  const MX = _buildMissionsAdapter(V);
  root.__MX = MX;

  // Tab switching
  root.querySelectorAll('.gc-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.gc-tab').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      _activeTab = btn.dataset.tab;

      const kpi     = root.querySelector('#gc-kpi');
      const filters = root.querySelector('#gc-filters');
      const isWorld = _activeTab === 'world';
      if (kpi)     kpi.style.display     = isWorld ? '' : 'none';
      if (filters) filters.style.display = isWorld ? '' : 'none';

      switch (_activeTab) {
        case 'world':     _loadWorld(root, V);    break;
        case 'prayer':    _loadPrayer(root, V);   break;
        case 'teams':     _loadTeams(root, V);    break;
        case 'partners':  _loadPartners(root, V); break;
        case 'updates':   _loadUpdates(root, V);  break;
        case 'resources': _showResources(root);   break;
      }
    });
  });

  // Event delegation: country card expand + prayer card toggle + "I Prayed"
  root.addEventListener('click', async (e) => {
    // Edit button on country card (admin/pastor)
    const editBtn = e.target.closest('.gc-edit-btn');
    if (editBtn) {
      e.stopPropagation();
      const id     = editBtn.dataset.editId;
      const record = _worldRows.find(r => r.id === id) || null;
      _openCountrySheet(record, () => _loadWorld(root, V));
      return;
    }

    // Country card click → expand/collapse detail rows
    const card = e.target.closest('.gc-country-card');
    if (card && !e.target.closest('.gc-profile-link')) {
      card.classList.toggle('is-open');
      return;
    }
    const hd = e.target.closest('.gc-prayer-hd');
    if (hd) {
      hd.closest('.gc-prayer-card')?.classList.toggle('is-open');
      return;
    }
    const btn = e.target.closest('.gc-pray-btn');
    if (btn && !btn.disabled) {
      e.preventDefault();
      const id = btn.dataset.id;
      if (!id || !V) return;
      btn.disabled = true;
      try {
        const MX = root.__MX;
        await MX.prayerFocus.respond({ id });
        const card    = btn.closest('.gc-prayer-card');
        const counter = card?.querySelector('.gc-prayer-count');
        if (counter) {
          const n = parseInt(counter.textContent.replace(/[^\d]/g, ''), 10) || 0;
          counter.textContent = `🙏 ${n + 1} praying`;
        } else {
          const meta = card?.querySelector('.gc-prayer-meta');
          if (meta) {
            const sp = document.createElement('span');
            sp.className = 'gc-prayer-count';
            sp.textContent = '🙏 1 praying';
            meta.appendChild(sp);
          }
        }
        btn.textContent  = '✅ Prayed';
        btn.style.opacity = '0.6';
      } catch {
        btn.disabled = false;
      }
    }
  });

  _loadWorld(root, V);

  return () => { /* nothing to clean up */ };
}

// ── World: country registry ────────────────────────────────────────────────────
async function _loadWorld(root, V) {
  _canEditRegistry = typeof window.Nehemiah !== 'undefined'
    && (window.Nehemiah.can?.('missions.registry.edit') || false);
  _setActionBar(root, 'world', V, () => _loadWorld(root, V));
  const content = root.querySelector('#gc-content');
  if (!content) return;
  content.innerHTML = '<div class="gc-loading">Loading country data…</div>';

  // Start Unreached of the Day fetch in parallel (non-blocking — shows if JP key is available)
  const uotdPromise = _getJpApiKey()
    .then(k => k ? _fetchUnreachedOfDay(k) : null)
    .catch(() => null);

  try {
    // Prefer UpperRoom direct Firestore (top-level `missionsRegistry` collection)
    // over TheVine which may apply church-scoping.
    const UR = window.UpperRoom;
    if (!UR && !V?.missions?.registry?.list) {
      content.innerHTML = '<div class="gc-empty">Missions backend not loaded — country registry unavailable.</div>';
      return;
    }
    let rawArr = [];
    if (UR && typeof UR.listMissionsRegistry === 'function') {
      const res = await UR.listMissionsRegistry({ limit: 300 });
      rawArr = Array.isArray(res) ? res : _normalize(res);
    } else if (V?.missions?.registry?.list) {
      rawArr = _normalize(await (root.__MX?.registry || V?.missions?.registry).list({ limit: 300 }));
    }

    // Sort: persecution severity first, then WWL rank ascending, then alphabetical
    const PERS_ORDER = {
      extreme: 0, severe: 1, 'very high': 1, considerable: 2, high: 2,
      moderate: 3, some: 4, minimal: 5, low: 6,
    };
    const rows = rawArr.slice().sort((a, b) => {
      const pa = PERS_ORDER[String(a.persecutionLevel || '').toLowerCase()] ?? 99;
      const pb = PERS_ORDER[String(b.persecutionLevel || '').toLowerCase()] ?? 99;
      if (pa !== pb) return pa - pb;
      const ra = parseInt(a.restrictionsRank ?? a.worldWatchListRank ?? 9999, 10);
      const rb = parseInt(b.restrictionsRank ?? b.worldWatchListRank ?? 9999, 10);
      if (!isNaN(ra) && !isNaN(rb) && ra !== rb) return ra - rb;
      return String(a.countryName || a.name || '').localeCompare(String(b.countryName || b.name || ''));
    });
    _worldRows = rows;

    const extremeCount   = rows.filter(r => String(r.persecutionLevel || '').toLowerCase() === 'extreme').length;
    const unreachedCount = rows.filter(r => (r.unreachedGroups > 0) || (r.populationUnreached > 0)).length;
    const win1040Count   = rows.filter(r =>
      r.tenFortyWindow === true || String(r.tenFortyWindow || '').toLowerCase() === 'yes'
    ).length;

    const kpiEl = root.querySelector('#gc-kpi');
    if (kpiEl) {
      kpiEl.innerHTML =
          _kpiCard('Countries Tracked',   rows.length,    'var(--accent,#5b8fcf)')
        + _kpiCard('Extreme Persecution', extremeCount,   'var(--danger,#dc2626)')
        + _kpiCard('Unreached Peoples',   unreachedCount, '#f59e0b')
        + _kpiCard('10/40 Window',        win1040Count,   '#818cf8');
    }

    // Await UOTD (was started before Firestore fetch, so nearly free)
    const uotdData = await uotdPromise;
    const uotdHtml = _unreachedOfDayCard(uotdData);

    if (!rows.length) {
      content.innerHTML = uotdHtml + '<div class="gc-empty">No country records found in the registry.</div>';
      return;
    }

    content.innerHTML = uotdHtml + `<div class="gc-country-grid">${rows.map(_countryCard).join('')}</div>`;
    _bindWorldFilters(root);
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load country data. ${_e(String(err.message || err))}</div>`;
  }
}

function _bindWorldFilters(root) {
  const search  = root.querySelector('#gc-search');
  const persF   = root.querySelector('#gc-pers-filter');
  const accF    = root.querySelector('#gc-access-filter');
  const win1040 = root.querySelector('#gc-1040-filter');
  const grid    = root.querySelector('.gc-country-grid');
  if (!grid) return;

  const apply = () => {
    const q    = (search?.value  || '').toLowerCase().trim();
    const pers = (persF?.value   || '').toLowerCase();
    const acc  = (accF?.value    || '').toLowerCase();
    const only = win1040?.checked ?? false;
    grid.querySelectorAll('.gc-country-card').forEach(card => {
      const ok =
        (!q    || card.dataset.country.includes(q))   &&
        (!pers || card.dataset.persecution === pers)   &&
        (!acc  || card.dataset.access === acc)         &&
        (!only || card.dataset['1040'] === 'yes');
      card.style.display = ok ? '' : 'none';
    });
  };

  search?.addEventListener('input',  apply);
  persF?.addEventListener('change',  apply);
  accF?.addEventListener('change',   apply);
  win1040?.addEventListener('change', apply);
}

// ── Prayer focus ───────────────────────────────────────────────────────────────
async function _loadPrayer(root, V) {
  _setActionBar(root, 'prayer', V, () => _loadPrayer(root, V));
  const content = root.querySelector('#gc-content');
  if (!content) return;
  const MX = root.__MX;
  if (!MX?.prayerFocus?.list) {
    content.innerHTML = '<div class="gc-empty">Missions backend not loaded — prayer focus unavailable.</div>';
    return;
  }
  content.innerHTML = '<div class="gc-loading">Loading prayer focus…</div>';

  try {
    const rows = _normalize(await MX.prayerFocus.list({ limit: 80 }));

    if (!rows.length) {
      content.innerHTML = '<div class="gc-empty">No prayer focus items yet. Add prayer needs through FlockOS to see them here.</div>';
      return;
    }

    const grouped = { urgent: [], high: [], normal: [] };
    rows.forEach(r => {
      const k = String(r.priority || r.Priority || 'normal').toLowerCase();
      (grouped[k] ?? grouped.normal).push(r);
    });

    let html = '<div class="gc-prayer-list">';
    for (const key of ['urgent', 'high', 'normal']) {
      if (!grouped[key].length) continue;
      html += `<div class="gc-prayer-group-hd">${_e(key.charAt(0).toUpperCase() + key.slice(1))} Priority</div>`;
      html += grouped[key].map(_prayerCard).join('');
    }
    html += '</div>';
    content.innerHTML = html;
    // Build prayer map + wire edit clicks
    _gcPrayerMap = {};
    rows.forEach(r => { if (r.id) _gcPrayerMap[String(r.id)] = r; });
    const reloadPrayer = () => _loadPrayer(root, V);
    content.querySelectorAll('[data-prayer-edit]').forEach(editBtn => {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rec = _gcPrayerMap[editBtn.dataset.prayerEdit];
        if (rec) _openMissionsSheet('prayer', V, reloadPrayer, rec);
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load prayer focus. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Mission teams ──────────────────────────────────────────────────────────────
async function _loadTeams(root, V) {
  _setActionBar(root, 'teams', V, () => _loadTeams(root, V));
  const content = root.querySelector('#gc-content');
  if (!content) return;
  const MX = root.__MX;
  if (!MX?.teams?.list) {
    content.innerHTML = '<div class="gc-empty">Missions backend not loaded — mission teams unavailable.</div>';
    return;
  }
  content.innerHTML = '<div class="gc-loading">Loading mission teams…</div>';
  try {
    const all = _normalize(await MX.teams.list({ limit: 60 }));
    // Filter out soft-deleted teams (tripStatus 'Cancelled' is used as the
    // delete sentinel because the GAS backend has no hard delete for teams).
    const rows = all.filter(r => {
      const s = String(r.tripStatus || r.status || '').toLowerCase();
      return s !== 'cancelled' && s !== 'deleted';
    });
    content.innerHTML = rows.length
      ? `<div class="gc-team-grid">${rows.map(_teamCard).join('')}</div>`
      : '<div class="gc-empty">No mission teams found. Add teams through FlockOS to track short-term trips and long-term workers.</div>';
    // Build map + wire edit clicks
    _gcTeamsMap = {};
    rows.forEach(r => { if (r.id) _gcTeamsMap[String(r.id)] = r; });
    const reload = () => _loadTeams(root, V);
    content.querySelectorAll('.gc-team-card').forEach(card => {
      card.addEventListener('click', () => {
        const rec = _gcTeamsMap[card.dataset.id];
        _openMissionsSheet('teams', V, reload, rec || null);
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load teams. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Mission partners ───────────────────────────────────────────────────────────
async function _loadPartners(root, V) {
  _setActionBar(root, 'partners', V, () => _loadPartners(root, V));
  const content = root.querySelector('#gc-content');
  if (!content) return;
  const MX = root.__MX;
  if (!MX?.partners?.list) {
    content.innerHTML = '<div class="gc-empty">Missions backend not loaded — partners unavailable.</div>';
    return;
  }
  content.innerHTML = '<div class="gc-loading">Loading mission partners…</div>';
  try {
    const rows = _normalize(await MX.partners.list({ limit: 100 }))
      .filter(r => {
        const s = String(r.status || r.relationshipStatus || '').toLowerCase();
        return s !== 'cancelled' && s !== 'deleted';
      });
    content.innerHTML = rows.length
      ? `<div class="gc-partner-grid">${rows.map(_partnerCard).join('')}</div>`
      : '<div class="gc-empty">No mission partners found. Add sending agencies and field partners through FlockOS.</div>';
    // Build map + wire edit clicks
    _gcPartnersMap = {};
    rows.forEach(r => { if (r.id) _gcPartnersMap[String(r.id)] = r; });
    const reload = () => _loadPartners(root, V);
    content.querySelectorAll('.gc-partner-card').forEach(card => {
      card.addEventListener('click', () => {
        const rec = _gcPartnersMap[card.dataset.id];
        _openMissionsSheet('partners', V, reload, rec || null);
      });
    });
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load partners. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Field updates ──────────────────────────────────────────────────────────────
async function _loadUpdates(root, V) {
  _setActionBar(root, 'updates', V, () => _loadUpdates(root, V));
  const content = root.querySelector('#gc-content');
  if (!content) return;
  const MX = root.__MX;
  if (!MX?.updates?.list) {
    content.innerHTML = '<div class="gc-empty">Missions backend not loaded — field updates unavailable.</div>';
    return;
  }
  content.innerHTML = '<div class="gc-loading">Loading field updates…</div>';
  try {
    const rows = _normalize(await MX.updates.list({ limit: 30 }))
      .filter(r => {
        const s = String(r.status || '').toLowerCase();
        return s !== 'cancelled' && s !== 'deleted';
      });
    content.innerHTML = rows.length
      ? `<div class="gc-updates-list">${rows.map(_updateCard).join('')}</div>`
      : '<div class="gc-empty">No field updates yet. Post situation reports, prayer alerts, and victory reports through FlockOS.</div>';
    if (rows.length) {
      _gcUpdatesMap = {};
      rows.forEach(r => { if (r.id) _gcUpdatesMap[String(r.id)] = r; });
      const reloadUpdates = () => _loadUpdates(root, V);
      content.querySelectorAll('.gc-update-card').forEach(card => {
        card.addEventListener('click', () => {
          const rec = _gcUpdatesMap[card.dataset.id];
          if (rec) _openMissionsSheet('updates', V, reloadUpdates, rec);
        });
      });
    }
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load updates. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Resources ──────────────────────────────────────────────────────────────────
function _showResources(root) {
  _setActionBar(root, 'resources', null, null);
  const content = root.querySelector('#gc-content');
  if (content) content.innerHTML = _resourcesPanel();
}

// ── Action bar ────────────────────────────────────────────────────────────────
function _setActionBar(root, tab, V, onRefresh) {
  const bar = root.querySelector('#gc-action-bar');
  if (!bar) return;

  // World tab: Add Country + Sync from Joshua Project (admin/pastor only)
  if (tab === 'world') {
    const canEdit = typeof window.Nehemiah !== 'undefined'
      && (window.Nehemiah.can?.('missions.registry.edit') || false);
    if (!canEdit) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
    bar.style.display = '';
    bar.innerHTML = `<div class="gc-action-hd">
      <button class="flock-btn flock-btn--primary gc-add-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add Country
      </button>
      <button class="flock-btn gc-sync-jp-btn" title="Import all countries from Joshua Project API">
        🌍 Sync from Joshua Project
      </button>
    </div>`;
    bar.querySelector('.gc-add-btn').addEventListener('click', () => {
      _openCountrySheet(null, onRefresh);
    });
    bar.querySelector('.gc-sync-jp-btn').addEventListener('click', () => {
      _syncFromJoshuaProject(root, onRefresh);
    });
    return;
  }

  const configs = {
    prayer:   { label: 'Add Prayer Need',  },
    teams:    { label: 'Add Mission Team', },
    partners: { label: 'Add Partner',      },
    updates:  { label: 'Add Field Update', },
  };
  const cfg = configs[tab];
  if (!cfg) { bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = '';
  bar.innerHTML = `<div class="gc-action-hd">
    <button class="flock-btn flock-btn--primary gc-add-btn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      ${_e(cfg.label)}
    </button>
  </div>`;
  bar.querySelector('.gc-add-btn').addEventListener('click', () => {
    _openMissionsSheet(tab, V, onRefresh);
  });
}

// ── Sync from Joshua Project ──────────────────────────────────────────────────
async function _syncFromJoshuaProject(root, onRefresh) {
  const UR = window.UpperRoom;
  if (!UR) { alert('UpperRoom not available.'); return; }

  const apiKey = await _getJpApiKey();
  if (!apiKey) {
    alert('No Joshua Project API key configured.\n\nGo to Admin → Settings → Integrations to add your key.');
    return;
  }

  const content = root.querySelector('#gc-content');
  const setMsg  = (html) => { if (content) content.innerHTML = html; };

  setMsg('<div class="gc-loading">Connecting to Joshua Project…</div>');

  try {
    const res = await fetch(`${_JP_BASE}/countries.json?api_key=${encodeURIComponent(apiKey)}&limit=300`);
    if (!res.ok) {
      setMsg(`<div class="gc-empty">Joshua Project API error ${res.status}: ${_e(res.statusText)}. Check your key in Admin → Integrations.</div>`);
      return;
    }

    const countries = await res.json();
    if (!Array.isArray(countries) || !countries.length) {
      setMsg('<div class="gc-empty">No countries returned from Joshua Project API.</div>');
      return;
    }

    setMsg(`<div class="gc-loading">Importing ${countries.length} countries… 0%</div>`);

    let imported = 0;
    let skipped  = 0;
    let errors   = 0;
    const total  = countries.length;

    for (const c of countries) {
      const mapped = _jpMapCountry(c);
      if (!mapped.countryName) { skipped++; continue; }
      try {
        await UR.createMissionsRegistry(mapped);
        imported++;
      } catch (_) { errors++; }

      if ((imported + errors) % 10 === 0) {
        const pct = Math.round(((imported + errors + skipped) / total) * 100);
        setMsg(`<div class="gc-loading">Importing… ${imported} of ${total} (${pct}%)</div>`);
      }
    }

    const summary = errors
      ? `✅ Imported ${imported} countries from Joshua Project (${errors} failed).`
      : `✅ Imported ${imported} countries from Joshua Project.`;
    setMsg(`<div class="gc-empty" style="color:var(--success,#16a34a);font-weight:600;">${summary}<br><span style="font-weight:400;font-size:.85em">Reloading registry…</span></div>`);
    setTimeout(() => { if (onRefresh) onRefresh(); }, 1800);

  } catch (err) {
    setMsg(`<div class="gc-empty">Sync failed: ${_e(String(err.message || err))}</div>`);
  }
}

// ── Country add / edit sheet ───────────────────────────────────────────────────
function _openCountrySheet(rec, onSaved) {
  _closeMissionsSheet();
  const isNew = !rec;
  const title = isNew ? 'Add Country to Registry' : `Edit: ${rec?.countryName || 'Country'}`;
  const val  = (f) => _e(String(rec?.[f] ?? ''));
  const sel  = (f, v) => String(rec?.[f] ?? '') === v ? ' selected' : '';

  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = `
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${_e(title)}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${_e(title)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        <div class="life-sheet-field">
          <div class="life-sheet-label">Country Name <span style="color:#ef4444">*</span></div>
          <input class="life-sheet-input" data-field="countryName" type="text" value="${val('countryName')}" placeholder="e.g. Afghanistan">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Continent / Region</div>
          <input class="life-sheet-input" data-field="continent" type="text" value="${val('continent')}" placeholder="e.g. Asia, Sub-Saharan Africa">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Persecution Level</div>
          <select class="life-sheet-input" data-field="persecutionLevel">
            <option value="">— Unknown / Not ranked —</option>
            <option value="Extreme"${sel('persecutionLevel', 'Extreme')}>Extreme</option>
            <option value="Severe"${sel('persecutionLevel', 'Severe')}>Severe</option>
            <option value="Considerable"${sel('persecutionLevel', 'Considerable')}>Considerable</option>
            <option value="Moderate"${sel('persecutionLevel', 'Moderate')}>Moderate</option>
            <option value="Some"${sel('persecutionLevel', 'Some')}>Some</option>
            <option value="Minimal"${sel('persecutionLevel', 'Minimal')}>Minimal</option>
            <option value="Low"${sel('persecutionLevel', 'Low')}>Low</option>
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">World Watch List Rank <span class="life-field-hint">1 = most persecuted</span></div>
          <input class="life-sheet-input" data-field="worldWatchListRank" type="number" min="0" max="200" value="${val('worldWatchListRank')}" placeholder="0">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Dominant Religion</div>
          <input class="life-sheet-input" data-field="dominantReligion" type="text" value="${val('dominantReligion')}" placeholder="e.g. Islam, Hinduism, Buddhism">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Population</div>
          <input class="life-sheet-input" data-field="population" type="number" min="0" value="${val('population')}" placeholder="0">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Christian % of Population</div>
          <input class="life-sheet-input" data-field="christianPercent" type="number" min="0" max="100" step="0.01" value="${val('christianPercent')}" placeholder="0.00">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">In the 10/40 Window</div>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font:0.9rem var(--font-ui);">
            <input type="checkbox" data-field="tenFortyWindow" ${rec?.tenFortyWindow ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer;">
            Yes, this country is in the 10/40 Window
          </label>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">ISO Code <span class="life-field-hint">2-letter country code</span></div>
          <input class="life-sheet-input" data-field="isoCode" type="text" maxlength="3" value="${val('isoCode')}" placeholder="e.g. AF, NG">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Flag Emoji</div>
          <input class="life-sheet-input" data-field="icon" type="text" value="${val('icon')}" placeholder="🇦🇫">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Profile URL <span class="life-field-hint">Joshua Project or Open Doors</span></div>
          <input class="life-sheet-input" data-field="profileUrl" type="url" value="${val('profileUrl')}" placeholder="https://joshuaproject.net/countries/AF">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Gospel Access</div>
          <select class="life-sheet-input" data-field="gospelAccess">
            <option value="">— Unknown —</option>
            <option value="Unreached"${sel('gospelAccess', 'Unreached')}>Unreached</option>
            <option value="Limited"${sel('gospelAccess', 'Limited')}>Limited</option>
            <option value="Restricted"${sel('gospelAccess', 'Restricted')}>Restricted</option>
            <option value="Partial"${sel('gospelAccess', 'Partial')}>Partial</option>
            <option value="Open"${sel('gospelAccess', 'Open')}>Open</option>
          </select>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Region <span class="life-field-hint">sub-region or area</span></div>
          <input class="life-sheet-input" data-field="region" type="text" value="${val('region')}" placeholder="e.g. Central Asia, West Africa">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Bible Access Rank <span class="life-field-hint">from Bible Access List</span></div>
          <input class="life-sheet-input" data-field="restrictionsRank" type="number" min="0" value="${val('restrictionsRank')}" placeholder="0">
        </div>
        <div class="life-sheet-field" style="display:flex;gap:10px;">
          <div style="flex:1;">
            <div class="life-sheet-label">Unreached Groups</div>
            <input class="life-sheet-input" data-field="unreachedGroups" type="number" min="0" value="${val('unreachedGroups')}" placeholder="0">
          </div>
          <div style="flex:1;">
            <div class="life-sheet-label">Unreached Population</div>
            <input class="life-sheet-input" data-field="populationUnreached" type="number" min="0" value="${val('populationUnreached')}" placeholder="0">
          </div>
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Bible Shortage Need</div>
          <input class="life-sheet-input" data-field="bibleShortageNeed" type="text" value="${val('bibleShortageNeed')}" placeholder="e.g. Critical, Severe, Moderate">
        </div>
        <div class="life-sheet-field">
          <div class="life-sheet-label">Notes</div>
          <textarea class="life-sheet-ta" data-field="notes" rows="2" placeholder="Additional notes…">${_e(rec?.notes || '')}</textarea>
        </div>
        <div class="gc-sheet-err" style="display:none;color:var(--danger,#dc2626);font:0.84rem var(--font-ui);margin-top:8px;"></div>
      </div>
      <div class="life-sheet-foot">
        ${!isNew ? '<button class="flock-btn flock-btn--danger" data-country-delete style="margin-right:auto">Delete</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-submit>${isNew ? 'Add Country' : 'Save Changes'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeMissionsSheet = sheet;

  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  const showErr = (msg) => {
    const el = sheet.querySelector('.gc-sheet-err');
    if (el) { el.textContent = msg; el.style.display = msg ? '' : 'none'; }
  };

  sheet.querySelector('.life-sheet-close').addEventListener('click', _closeMissionsSheet);
  sheet.querySelector('[data-cancel]').addEventListener('click', _closeMissionsSheet);

  sheet.querySelector('[data-submit]').addEventListener('click', async () => {
    const btn = sheet.querySelector('[data-submit]');
    showErr('');

    const get    = (f) => (sheet.querySelector(`[data-field="${f}"]`)?.value ?? '').trim();
    const getNum = (f) => { const v = parseFloat(get(f)); return isNaN(v) ? undefined : v; };
    const getBool = (f) => sheet.querySelector(`[data-field="${f}"]`)?.checked ?? false;

    if (!get('countryName')) { showErr('Country name is required.'); return; }
    const UR = window.UpperRoom;
    if (!UR) { showErr('UpperRoom API not available — cannot save.'); return; }

    const changes = {
      countryName: get('countryName'),
      ...(get('continent')         ? { continent:         get('continent')         } : {}),
      ...(get('persecutionLevel')  ? { persecutionLevel:  get('persecutionLevel')  } : {}),
      ...(get('dominantReligion')  ? { dominantReligion:  get('dominantReligion')  } : {}),
      ...(get('gospelAccess')      ? { gospelAccess:      get('gospelAccess')      } : {}),
      ...(get('region')            ? { region:            get('region')            } : {}),
      ...(get('bibleShortageNeed') ? { bibleShortageNeed: get('bibleShortageNeed') } : {}),
      ...(get('notes')             ? { notes:             get('notes')             } : {}),
      ...(getNum('population')          !== undefined ? { population:          getNum('population')          } : {}),
      ...(getNum('worldWatchListRank')  !== undefined ? { worldWatchListRank:  getNum('worldWatchListRank')  } : {}),
      ...(getNum('restrictionsRank')    !== undefined ? { restrictionsRank:    getNum('restrictionsRank')    } : {}),
      ...(getNum('christianPercent')    !== undefined ? { christianPercent:    getNum('christianPercent')    } : {}),
      ...(getNum('unreachedGroups')     !== undefined ? { unreachedGroups:     getNum('unreachedGroups')     } : {}),
      ...(getNum('populationUnreached') !== undefined ? { populationUnreached: getNum('populationUnreached') } : {}),
      ...(get('profileUrl') ? { profileUrl: get('profileUrl') } : {}),
      ...(get('isoCode')    ? { isoCode:    get('isoCode')    } : {}),
      ...(get('icon')       ? { icon:       get('icon')       } : {}),
      tenFortyWindow: getBool('tenFortyWindow'),
    };

    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      if (isNew) {
        await UR.createMissionsRegistry(changes);
      } else {
        await UR.updateMissionsRegistry({ id: rec.id, ...changes });
      }
      _closeMissionsSheet();
      if (onSaved) onSaved();
    } catch (err) {
      showErr('Could not save: ' + (err?.message || String(err)));
      btn.disabled = false; btn.textContent = isNew ? 'Add Country' : 'Save Changes';
    }
  });

  // Delete country (edit mode only)
  sheet.querySelector('[data-country-delete]')?.addEventListener('click', async () => {
    if (!rec?.id) return;
    const ok = confirm(`Delete ${rec.countryName || 'this country'} from the registry? This cannot be undone.`);
    if (!ok) return;
    const dBtn = sheet.querySelector('[data-country-delete]');
    dBtn.disabled = true; dBtn.textContent = 'Deleting…';
    const UR = window.UpperRoom;
    if (!UR) { showErr('UpperRoom API not available.'); dBtn.disabled = false; dBtn.textContent = 'Delete'; return; }
    try {
      await UR.deleteMissionsRegistry({ id: rec.id });
      _closeMissionsSheet();
      if (onSaved) onSaved();
    } catch (err) {
      showErr('Could not delete: ' + (err?.message || String(err)));
      dBtn.disabled = false; dBtn.textContent = 'Delete';
    }
  });
}

// ── Missions entry sheet ─────────────────────────────────────────────────────
let _activeMissionsSheet = null;
let _canEditRegistry     = false;   // set on each _loadWorld call
let _worldRows           = [];      // cached for edit lookups
let _gcTeamsMap          = {};
let _gcPartnersMap       = {};
let _gcPrayerMap         = {};
let _gcUpdatesMap        = {};

function _closeMissionsSheet() {
  if (!_activeMissionsSheet) return;
  const s = _activeMissionsSheet;
  _activeMissionsSheet = null;
  s.querySelector('.life-sheet-panel')?.classList.remove('is-open');
  s.querySelector('.life-sheet-overlay')?.classList.remove('is-open');
  setTimeout(() => s.remove(), 280);
}

function _missionsFormFields(type) {
  if (type === 'prayer') return `
    <div class="life-sheet-field">
      <div class="life-sheet-label">Title <span style="color:#ef4444">*</span></div>
      <input class="life-sheet-input" data-field="title" type="text" placeholder="Prayer need title">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Priority</div>
      <select class="life-sheet-input" data-field="priority">
        <option value="normal">Normal</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Country <span class="life-field-hint">optional</span></div>
      <input class="life-sheet-input" data-field="country" type="text" placeholder="e.g. Iran, Nigeria">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">People Group <span class="life-field-hint">optional</span></div>
      <input class="life-sheet-input" data-field="peopleGroup" type="text" placeholder="e.g. Pashtun, Fulani">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Background / Description <span class="life-field-hint">optional</span></div>
      <textarea class="life-sheet-ta" data-field="description" rows="3" placeholder="Context and background…"></textarea>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Scripture <span class="life-field-hint">optional</span></div>
      <input class="life-sheet-input" data-field="scripture" type="text" placeholder="e.g. Romans 10:14">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Prayer Points <span class="life-field-hint">one per line</span></div>
      <textarea class="life-sheet-ta" data-field="prayerPoints" rows="4" placeholder="Pray for open doors…&#10;Pray for protection for church planters…"></textarea>
    </div>
    <div class="life-sheet-field" style="display:flex;gap:10px;">
      <div style="flex:1;">
        <div class="life-sheet-label">Start Date <span class="life-field-hint">optional</span></div>
        <input class="life-sheet-input" data-field="startDate" type="date">
      </div>
      <div style="flex:1;">
        <div class="life-sheet-label">End Date <span class="life-field-hint">optional</span></div>
        <input class="life-sheet-input" data-field="endDate" type="date">
      </div>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Notes</div>
      <textarea class="life-sheet-ta" data-field="notes" rows="2" placeholder="Additional notes…"></textarea>
    </div>`;

  if (type === 'teams') return `
    <div class="life-sheet-field">
      <div class="life-sheet-label">Team Name <span style="color:#ef4444">*</span></div>
      <input class="life-sheet-input" data-field="teamName" type="text" placeholder="e.g. Guatemala Summer Team 2026">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Country / Location</div>
      <input class="life-sheet-input" data-field="countryId" type="text" placeholder="e.g. Guatemala, Brazil">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Trip Type</div>
      <select class="life-sheet-input" data-field="tripType">
        <option value="">— Select —</option>
        <option>Short-term</option>
        <option>Long-term</option>
        <option>Survey</option>
        <option>Medical</option>
        <option>Teaching</option>
        <option>Construction</option>
        <option>Other</option>
      </select>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Status</div>
      <select class="life-sheet-input" data-field="tripStatus">
        <option value="planning">Planning</option>
        <option value="fundraising">Fundraising</option>
        <option value="ready">Ready</option>
        <option value="on field">On Field</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
    <div class="life-sheet-field" style="display:flex;gap:10px;">
      <div style="flex:1;">
        <div class="life-sheet-label">Start Date</div>
        <input class="life-sheet-input" data-field="startDate" type="date">
      </div>
      <div style="flex:1;">
        <div class="life-sheet-label">End Date</div>
        <input class="life-sheet-input" data-field="endDate" type="date">
      </div>
    </div>
    <div class="life-sheet-field" style="display:flex;gap:10px;">
      <div style="flex:1;">
        <div class="life-sheet-label">Budget ($)</div>
        <input class="life-sheet-input" data-field="budget" type="number" min="0" placeholder="0">
      </div>
      <div style="flex:1;">
        <div class="life-sheet-label">Raised ($)</div>
        <input class="life-sheet-input" data-field="raised" type="number" min="0" placeholder="0">
      </div>
    </div>
    <div class="life-sheet-field" style="display:flex;gap:10px;">
      <div style="flex:1;">
        <div class="life-sheet-label">Member Count</div>
        <input class="life-sheet-input" data-field="memberCount" type="number" min="1" placeholder="0">
      </div>
      <div style="flex:1;">
        <div class="life-sheet-label">Team Lead Name</div>
        <input class="life-sheet-input" data-field="teamLeadName" type="text" placeholder="Full name">
      </div>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Notes</div>
      <textarea class="life-sheet-ta" data-field="notes" rows="2" placeholder="Additional notes…"></textarea>
    </div>`;

  if (type === 'partners') return `
    <div class="life-sheet-field">
      <div class="life-sheet-label">Organization Name <span style="color:#ef4444">*</span></div>
      <input class="life-sheet-input" data-field="organizationName" type="text" placeholder="e.g. SIM, ABWE, OM">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Partner Type</div>
      <select class="life-sheet-input" data-field="partnerType">
        <option value="">— Select —</option>
        <option>Sending Agency</option>
        <option>Field Team</option>
        <option>Translation</option>
        <option>Media</option>
        <option>Humanitarian</option>
        <option>Church Network</option>
      </select>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Focus Area</div>
      <input class="life-sheet-input" data-field="focusArea" type="text" placeholder="e.g. North Africa, Bible translation">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Relationship Status</div>
      <select class="life-sheet-input" data-field="relationshipStatus">
        <option value="Active">Active</option>
        <option value="Exploring">Exploring</option>
        <option value="Legacy">Legacy</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Workers Count</div>
      <input class="life-sheet-input" data-field="workersCount" type="number" min="0" placeholder="0">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Website</div>
      <input class="life-sheet-input" data-field="website" type="url" placeholder="https://…">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Description</div>
      <textarea class="life-sheet-ta" data-field="description" rows="3" placeholder="Brief description of their work and mission…"></textarea>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Notes</div>
      <textarea class="life-sheet-ta" data-field="notes" rows="2" placeholder="Additional notes…"></textarea>
    </div>`;

  if (type === 'updates') return `
    <div class="life-sheet-field">
      <div class="life-sheet-label">Title <span style="color:#ef4444">*</span></div>
      <input class="life-sheet-input" data-field="title" type="text" placeholder="Update headline">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Update Type</div>
      <select class="life-sheet-input" data-field="updateType">
        <option value="">— Select —</option>
        <option>Prayer Alert</option>
        <option>Situation Report</option>
        <option>Victory Report</option>
        <option>Breaking</option>
        <option>Analysis</option>
      </select>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Severity</div>
      <select class="life-sheet-input" data-field="severity">
        <option value="Informational">Informational</option>
        <option value="Moderate">Moderate</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Country / Region</div>
      <input class="life-sheet-input" data-field="country" type="text" placeholder="e.g. North Korea, Sahel Region">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Report Body <span style="color:#ef4444">*</span></div>
      <textarea class="life-sheet-ta" data-field="body" rows="5" placeholder="Full update text…"></textarea>
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Source</div>
      <input class="life-sheet-input" data-field="source" type="text" placeholder="e.g. Open Doors, VOM, Field Partner">
    </div>
    <div class="life-sheet-field">
      <div class="life-sheet-label">Notes</div>
      <textarea class="life-sheet-ta" data-field="notes" rows="2" placeholder="Additional notes…"></textarea>
    </div>`;

  return '';
}

const _GC_TITLES = {
  prayer:   'Add Prayer Need',
  teams:    'Add Mission Team',
  partners: 'Add Partner',
  updates:  'Add Field Update',
};
const _GC_EDIT_TITLES = {
  prayer:   'Edit Prayer Need',
  teams:    'Edit Mission Team',
  partners: 'Edit Partner',
  updates:  'Edit Field Update',
};

function _openMissionsSheet(type, V, onSaved, rec = null) {
  _closeMissionsSheet();
  const isEdit = !!(rec?.id);
  const title  = isEdit ? (_GC_EDIT_TITLES[type] || 'Edit Entry') : (_GC_TITLES[type] || 'Add Entry');
  const sheet = document.createElement('div');
  sheet.className = 'life-sheet';
  sheet.innerHTML = `
    <div class="life-sheet-overlay"></div>
    <div class="life-sheet-panel" role="dialog" aria-label="${_e(title)}">
      <div class="life-sheet-drag"></div>
      <div class="life-sheet-hd">
        <div class="life-sheet-hd-info">
          <div class="life-sheet-hd-name">${_e(title)}</div>
        </div>
        <button class="life-sheet-close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="life-sheet-body">
        ${_missionsFormFields(type)}
        <div class="gc-sheet-err" style="display:none;color:var(--danger,#dc2626);font:0.84rem var(--font-ui);margin-top:8px;"></div>
      </div>
      <div class="life-sheet-foot">
        ${isEdit ? '<button class="flock-btn flock-btn--danger" data-delete style="margin-right:auto">Delete</button>' : ''}
        <button class="flock-btn" data-cancel>Cancel</button>
        <button class="flock-btn flock-btn--primary" data-submit>${isEdit ? 'Save Changes' : 'Save'}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  _activeMissionsSheet = sheet;

  requestAnimationFrame(() => {
    sheet.querySelector('.life-sheet-overlay').classList.add('is-open');
    sheet.querySelector('.life-sheet-panel').classList.add('is-open');
  });

  const showErr = (msg) => {
    const el = sheet.querySelector('.gc-sheet-err');
    if (el) { el.textContent = msg; el.style.display = msg ? '' : 'none'; }
  };

  // Pre-fill fields for edit mode
  if (isEdit && rec) {
    const _pf = (field, val) => {
      const el = sheet.querySelector(`[data-field="${field}"]`);
      if (!el || val == null || val === '') return;
      if (el.tagName === 'SELECT') el.value = String(val);
      else el.value = val;
    };
    // Teams
    _pf('teamName',           rec.teamName    || rec.name);
    _pf('countryId',          rec.countryId   || rec.country);
    _pf('tripType',           rec.tripType);
    _pf('tripStatus',         rec.tripStatus  || rec.status);
    _pf('startDate',          rec.startDate ? String(rec.startDate).substring(0,10) : undefined);
    _pf('endDate',            rec.endDate   ? String(rec.endDate).substring(0,10)   : undefined);
    _pf('budget',             rec.budget);
    _pf('raised',             rec.raised);
    _pf('memberCount',        rec.memberCount || rec.teamMembers);
    _pf('teamLeadName',       rec.teamLeadName || rec.leadName);
    // Partners
    _pf('organizationName',   rec.organizationName || rec.name);
    _pf('partnerType',        rec.partnerType || rec.type);
    _pf('focusArea',          rec.focusArea);
    _pf('relationshipStatus', rec.relationshipStatus || rec.status);
    _pf('workersCount',       rec.workersCount);
    _pf('website',            rec.website);
    _pf('description',        rec.description);
    // Prayer
    _pf('title',              rec.title || rec.Title);
    _pf('priority',           rec.priority || rec.Priority);
    _pf('country',            rec.country || rec.countryId);
    _pf('peopleGroup',        rec.peopleGroup);
    _pf('scripture',          rec.scripture || rec.Scripture);
    _pf('prayerPoints',       Array.isArray(rec.prayerPoints) ? rec.prayerPoints.join('\n') : rec.prayerPoints);
    // Updates
    _pf('updateType',         rec.updateType || rec.UpdateType || rec.type);
    _pf('severity',           rec.severity   || rec.Severity);
    _pf('body',               rec.body       || rec.Body);
    _pf('source',             rec.source);
    // Common
    _pf('notes',              rec.notes);
  }

  sheet.querySelector('.life-sheet-close').addEventListener('click', _closeMissionsSheet);
  sheet.querySelector('[data-cancel]').addEventListener('click', _closeMissionsSheet);

  sheet.querySelector('[data-submit]').addEventListener('click', async () => {
    const btn = sheet.querySelector('[data-submit]');
    showErr('');

    const get    = (f) => (sheet.querySelector(`[data-field="${f}"]`)?.value ?? '').trim();
    const getNum = (f) => { const v = parseFloat(get(f)); return isNaN(v) ? undefined : v; };

    let payload = {};
    if (type === 'prayer') {
      if (!get('title')) { showErr('Title is required.'); return; }
      payload = { title: get('title'), priority: get('priority') || 'normal',
        ...(get('country')      ? { country:      get('country')      } : {}),
        ...(get('peopleGroup')  ? { peopleGroup:  get('peopleGroup')  } : {}),
        ...(get('description')  ? { description:  get('description')  } : {}),
        ...(get('scripture')    ? { scripture:    get('scripture')    } : {}),
        ...(get('prayerPoints') ? { prayerPoints: get('prayerPoints') } : {}),
        ...(get('startDate')    ? { startDate:    get('startDate')    } : {}),
        ...(get('endDate')      ? { endDate:      get('endDate')      } : {}),
        ...(get('notes')        ? { notes:        get('notes')        } : {}),
      };
    } else if (type === 'teams') {
      if (!get('teamName')) { showErr('Team Name is required.'); return; }
      payload = { teamName: get('teamName'),
        ...(get('countryId')    ? { countryId:    get('countryId')    } : {}),
        ...(get('tripType')     ? { tripType:     get('tripType')     } : {}),
        ...(get('tripStatus')   ? { tripStatus:   get('tripStatus')   } : {}),
        ...(get('startDate')    ? { startDate:    get('startDate')    } : {}),
        ...(get('endDate')      ? { endDate:      get('endDate')      } : {}),
        ...(getNum('budget')      !== undefined ? { budget:      getNum('budget')      } : {}),
        ...(getNum('raised')      !== undefined ? { raised:      getNum('raised')      } : {}),
        ...(getNum('memberCount') !== undefined ? { memberCount: getNum('memberCount') } : {}),
        ...(get('teamLeadName') ? { teamLeadName: get('teamLeadName') } : {}),
        ...(get('notes')        ? { notes:        get('notes')        } : {}),
      };
    } else if (type === 'partners') {
      if (!get('organizationName')) { showErr('Organization Name is required.'); return; }
      payload = { organizationName: get('organizationName'),
        ...(get('partnerType')        ? { partnerType:        get('partnerType')        } : {}),
        ...(get('focusArea')          ? { focusArea:          get('focusArea')          } : {}),
        ...(get('relationshipStatus') ? { relationshipStatus: get('relationshipStatus') } : {}),
        ...(getNum('workersCount')    !== undefined ? { workersCount: getNum('workersCount') } : {}),
        ...(get('website')            ? { website:            get('website')            } : {}),
        ...(get('description')        ? { description:        get('description')        } : {}),
        ...(get('notes')              ? { notes:              get('notes')              } : {}),
      };
    } else if (type === 'updates') {
      if (!get('title')) { showErr('Title is required.'); return; }
      if (!get('body'))  { showErr('Report body is required.'); return; }
      payload = { title: get('title'), body: get('body'),
        ...(get('updateType') ? { updateType: get('updateType') } : {}),
        ...(get('severity')   ? { severity:   get('severity')   } : {}),
        ...(get('country')    ? { country:    get('country')    } : {}),
        ...(get('source')     ? { source:     get('source')     } : {}),
        ...(get('notes')      ? { notes:      get('notes')      } : {}),
      };
    }

    if (isEdit) payload.id = rec.id;
    const MX = _buildMissionsAdapter(V);
    if (!MX) { showErr('Missions backend not loaded — cannot save.'); return; }
    btn.disabled = true; btn.textContent = 'Saving…';
    try {
      const nsMap = { prayer: 'prayerFocus', teams: 'teams', partners: 'partners', updates: 'updates' };
      if (isEdit) { await MX[nsMap[type]].update(payload); }
      else        { await MX[nsMap[type]].create(payload); }
      _closeMissionsSheet();
      if (onSaved) onSaved();
    } catch (err) {
      showErr('Could not save: ' + (err?.message || String(err)));
      btn.disabled = false; btn.textContent = isEdit ? 'Save Changes' : 'Save';
    }
  });

  // Delete (edit mode only)
  sheet.querySelector('[data-delete]')?.addEventListener('click', async () => {
    const label = type === 'partners' ? (rec.organizationName || rec.name || 'this partner')
                : type === 'teams'    ? (rec.teamName || rec.name || 'this team') : 'this entry';
    const ok = confirm(`Delete ${label}? This cannot be undone.`);
    if (!ok) return;
    const btn = sheet.querySelector('[data-delete]');
    btn.disabled = true; btn.textContent = 'Deleting…';
    try {
      const nsMap = { prayer: 'prayerFocus', teams: 'teams', partners: 'partners', updates: 'updates' };
      const ns = nsMap[type];
      const MX = _buildMissionsAdapter(V);
      try {
        await MX[ns].delete({ id: rec.id });
      } catch (delErr) {
        // GAS-only fallback: legacy GAS handlers may not have a hard delete
        // for this resource yet. Soft-delete via update: tripStatus/status='Cancelled'.
        // The list views filter Cancelled rows out so it appears deleted.
        // (Firestore path always supports hard delete via UpperRoom.)
        const msg = String(delErr?.message || delErr || '').toLowerCase();
        const isUnknown = msg.includes('unknown action') || msg.includes('not found') || msg.includes('not implemented');
        if (!isUnknown) throw delErr;
        const softPayload = { id: rec.id };
        if (type === 'teams') softPayload.tripStatus = 'Cancelled';
        else                  softPayload.status     = 'Cancelled';
        await MX[ns].update(softPayload);
      }
      _closeMissionsSheet();
      if (onSaved) onSaved();
    } catch (err) {
      console.error('[GreatCommission] delete error:', err);
      btn.disabled = false; btn.textContent = 'Delete';
      alert(err?.message || 'Could not delete entry.');
    }
  });
}
