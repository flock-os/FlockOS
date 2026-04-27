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
  const cname = r.countryName || r.name || '';
  const rank  = r.restrictionsRank ?? r.persecutionRank ?? r.rank ?? '';
  const pers  = r.persecutionLevel || r.persecution || '';
  const acc   = r.gospelAccess || r.access || '';
  const is1040 = String(r['10/40Window'] || r.tenFortyWindow || '').toLowerCase() === 'yes'
              || r['10/40Window'] === true || r.tenFortyWindow === true;
  const pop          = r.population      ? Number(r.population).toLocaleString()       : null;
  const popUnreached = r.populationUnreached ? Number(r.populationUnreached).toLocaleString() : null;
  const wwl          = r.worldWatchListRank != null ? r.worldWatchListRank               : null;
  const ungroups     = r.unreachedGroups   != null ? r.unreachedGroups                   : null;
  const pctChrist    = r.christianPercent  != null
    ? (r.christianPercent < 1
        ? r.christianPercent.toFixed(2)
        : r.christianPercent.toFixed(1)) + '%'
    : null;

  return `
    <article class="gc-country-card"
      data-country="${_e(cname.toLowerCase())}"
      data-persecution="${_e(String(pers).toLowerCase())}"
      data-access="${_e(String(acc).toLowerCase())}"
      data-1040="${is1040 ? 'yes' : 'no'}">
      <div class="gc-card-top">
        <span class="gc-flag">${_e(r.icon || '🌍')}</span>
        ${rank !== '' ? `<span class="gc-rank-pill">#${_e(String(rank))}</span>` : ''}
      </div>
      <div class="gc-country-name">${_e(cname)}</div>
      <div class="gc-country-meta">${_e(r.continent || '')}${r.continent && r.region ? ' · ' : ''}${_e(r.region || '')}</div>
      <div class="gc-badges">
        ${_persLevel(pers)}
        ${_gospelAccess(acc)}
        ${is1040 ? '<span class="gc-1040-badge">10/40</span>' : ''}
      </div>
      <div class="gc-country-detail">
        ${r.dominantReligion ? `<span>⛪ ${_e(r.dominantReligion)}</span>` : ''}
        ${pop             ? `<span>👥 ${pop}</span>`                                        : ''}
        ${pctChrist       ? `<span>✝️ ${pctChrist} Christian</span>`                        : ''}
        ${wwl    != null  ? `<span>📋 WWL #${_e(String(wwl))}</span>`                       : ''}
        ${ungroups != null ? `<span>🔴 ${_e(String(ungroups))} unreached groups</span>`    : ''}
        ${popUnreached    ? `<span>📍 ${popUnreached} in unreached pop.</span>`             : ''}
        ${r.bibleShortageNeed ? `<span>📖 Bible need: ${_e(r.bibleShortageNeed)}</span>`   : ''}
      </div>
      ${r.profileUrl
        ? `<a class="gc-profile-link" href="${_e(r.profileUrl)}" target="_blank" rel="noopener noreferrer">View Profile ↗</a>`
        : ''}
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
    <div class="gc-team-card">
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
    <div class="gc-partner-card">
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
    <div class="gc-update-card" style="border-left-color:${c};">
      <span class="gc-update-icon">${icon}</span>
      <div class="gc-update-content">
        <div class="gc-update-title">${_e(r.title || r.Title || '')}</div>
        ${r.updateType || r.UpdateType || r.type
          ? `<span class="gc-update-type">${_e(r.updateType || r.UpdateType || r.type)}</span>`
          : ''}
        ${body ? `<p class="gc-update-body">${_e(body)}</p>` : ''}
        <div class="gc-update-meta">
          ${r.source    ? `<span>📡 ${_e(r.source)}</span>`                           : ''}
          ${r.createdAt ? `<span>🕒 ${_e(String(r.createdAt).substring(0, 10))}</span>` : ''}
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

  // Event delegation: prayer card toggle + "I Prayed"
  root.addEventListener('click', async (e) => {
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
        await V.missions.prayerFocus.respond({ id });
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
  const content = root.querySelector('#gc-content');
  if (!content) return;
  content.innerHTML = '<div class="gc-loading">Loading country data…</div>';

  try {
    const raw  = await V.missions.registry.list({ limit: 300 });
    const rows = _normalize(raw).slice().sort((a, b) => {
      const ra = parseInt(a.restrictionsRank ?? a.persecutionRank ?? a.rank, 10);
      const rb = parseInt(b.restrictionsRank ?? b.persecutionRank ?? b.rank, 10);
      const va = isNaN(ra) ? Infinity : ra;
      const vb = isNaN(rb) ? Infinity : rb;
      if (va !== vb) return va - vb;
      return String(a.countryName || a.name || '').localeCompare(String(b.countryName || b.name || ''));
    });

    const extremeCount   = rows.filter(r => String(r.persecutionLevel || r.persecution || '').toLowerCase() === 'extreme').length;
    const unreachedCount = rows.filter(r => String(r.gospelAccess || r.access || '').toLowerCase() === 'unreached').length;
    const win1040Count   = rows.filter(r =>
      String(r['10/40Window'] || r.tenFortyWindow || '').toLowerCase() === 'yes'
      || r['10/40Window'] === true || r.tenFortyWindow === true
    ).length;

    const kpiEl = root.querySelector('#gc-kpi');
    if (kpiEl) {
      kpiEl.innerHTML =
          _kpiCard('Countries Tracked',   rows.length,    'var(--accent,#5b8fcf)')
        + _kpiCard('Extreme Persecution', extremeCount,   'var(--danger,#dc2626)')
        + _kpiCard('Unreached Gospel',    unreachedCount, '#f59e0b')
        + _kpiCard('10/40 Window',        win1040Count,   '#818cf8');
    }

    if (!rows.length) {
      content.innerHTML = '<div class="gc-empty">No country records found in the registry.</div>';
      return;
    }

    content.innerHTML = `<div class="gc-country-grid">${rows.map(_countryCard).join('')}</div>`;
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
  const content = root.querySelector('#gc-content');
  if (!content) return;
  content.innerHTML = '<div class="gc-loading">Loading prayer focus…</div>';

  try {
    const rows = _normalize(await V.missions.prayerFocus.list({ limit: 80 }));

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
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load prayer focus. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Mission teams ──────────────────────────────────────────────────────────────
async function _loadTeams(root, V) {
  const content = root.querySelector('#gc-content');
  if (!content) return;
  content.innerHTML = '<div class="gc-loading">Loading mission teams…</div>';
  try {
    const rows = _normalize(await V.missions.teams.list({ limit: 60 }));
    content.innerHTML = rows.length
      ? `<div class="gc-team-grid">${rows.map(_teamCard).join('')}</div>`
      : '<div class="gc-empty">No mission teams found. Add teams through FlockOS to track short-term trips and long-term workers.</div>';
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load teams. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Mission partners ───────────────────────────────────────────────────────────
async function _loadPartners(root, V) {
  const content = root.querySelector('#gc-content');
  if (!content) return;
  content.innerHTML = '<div class="gc-loading">Loading mission partners…</div>';
  try {
    const rows = _normalize(await V.missions.partners.list({ limit: 100 }));
    content.innerHTML = rows.length
      ? `<div class="gc-partner-grid">${rows.map(_partnerCard).join('')}</div>`
      : '<div class="gc-empty">No mission partners found. Add sending agencies and field partners through FlockOS.</div>';
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load partners. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Field updates ──────────────────────────────────────────────────────────────
async function _loadUpdates(root, V) {
  const content = root.querySelector('#gc-content');
  if (!content) return;
  content.innerHTML = '<div class="gc-loading">Loading field updates…</div>';
  try {
    const rows = _normalize(await V.missions.updates.list({ limit: 30 }));
    content.innerHTML = rows.length
      ? `<div class="gc-updates-list">${rows.map(_updateCard).join('')}</div>`
      : '<div class="gc-empty">No field updates yet. Post situation reports, prayer alerts, and victory reports through FlockOS.</div>';
  } catch (err) {
    content.innerHTML = `<div class="gc-empty">Could not load updates. ${_e(String(err.message || err))}</div>`;
  }
}

// ── Resources ──────────────────────────────────────────────────────────────────
function _showResources(root) {
  const content = root.querySelector('#gc-content');
  if (content) content.innerHTML = _resourcesPanel();
}
