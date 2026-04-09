/* ══════════════════════════════════════════════════════════════════════════════
   THE TRUTH — FlockOS Matthew Content Editor
   Full CRUD interface for all Matthew (APP) public-content tabs:
   Books, Genealogy, Counseling, Devotionals, Reading Plan, Lexicon,
   Heart Check, Mirror, Quiz, Apologetics.

   Depends on: Modules (the_tabernacle.js), TheVine (the_true_vine.js)

   Restricted to: Pastor + Admin roles only.

   "Sanctify them by the truth; your word is truth." — John 17:17
   ══════════════════════════════════════════════════════════════════════════════ */

const TheTruth = (() => {
  'use strict';

  // ── Helpers (self-contained so this module has no internal dependencies) ──

  function _e(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function _spinner() {
    return '<div style="text-align:center;padding:60px 20px;color:var(--ink-muted);">'
         + '<div style="margin:0 auto 16px;width:32px;height:32px;border:3px solid var(--line);'
         + 'border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite;"></div>'
         + 'Loading\u2026</div>';
  }

  function _errHtml(msg) {
    return '<div style="padding:24px;text-align:center;color:var(--danger);">'
         + '<p style="font-size:1rem;font-weight:600;">Error</p>'
         + '<p style="font-size:0.85rem;">' + _e(msg) + '</p></div>';
  }

  function _empty(icon, title, desc) {
    return '<div style="text-align:center;padding:60px 20px;color:var(--ink-muted);">'
         + '<div style="font-size:2.5rem;margin-bottom:12px;">' + icon + '</div>'
         + '<h2 style="font-size:1.1rem;margin-bottom:6px;color:var(--ink);">' + _e(title) + '</h2>'
         + '<p style="font-size:0.85rem;">' + _e(desc) + '</p></div>';
  }

  function _toast(msg, type) {
    if (typeof Modules !== 'undefined' && Modules._toast) { Modules._toast(msg, type); return; }
    alert(msg);
  }

  function _rows(raw) {
    if (typeof Modules !== 'undefined' && Modules._rows) return Modules._rows(raw);
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw.rows && Array.isArray(raw.rows)) return raw.rows;
    return [];
  }

  // ── State ─────────────────────────────────────────────────────────────────

  var _tab     = 'books';
  var _pages   = {};   // current page per tab key (1-based)
  var _allRows = {};   // full cached row set per tab key; cleared on save/delete
  var PAGE_SIZE = 50;

  // ── Tab definitions ───────────────────────────────────────────────────────

  var TABS = [
    { key: 'books', name: 'Books', api: 'books', idField: 'Book Name',
      listCols: ['Book Name', 'Testament', 'Genre'],
      fields: [
        { k: 'Book Name',             label: 'Book Name',             type: 'text',     required: true },
        { k: 'Testament',             label: 'Testament',             type: 'select',   opts: ['Old', 'New'] },
        { k: 'Genre',                 label: 'Genre',                 type: 'text' },
        { k: 'Type',                  label: 'Type',                  type: 'text' },
        { k: 'Summary',               label: 'Summary',               type: 'textarea' },
        { k: 'Core Theology',         label: 'Core Theology',         type: 'textarea' },
        { k: 'Practical Application', label: 'Practical Application', type: 'textarea' },
      ]
    },
    { key: 'genealogy', name: 'Genealogy', api: 'genealogy', idField: 'Name',
      listCols: ['Name', 'Title', 'Lifespan'],
      fields: [
        { k: 'Name',      label: 'Name',                       type: 'text',     required: true },
        { k: 'Title',     label: 'Title / Role',               type: 'text' },
        { k: 'Meaning',   label: 'Name Meaning',               type: 'text' },
        { k: 'Lifespan',  label: 'Lifespan',                   type: 'text' },
        { k: 'Bio',       label: 'Biography',                  type: 'textarea' },
        { k: 'Reference', label: 'Scripture Reference',        type: 'text' },
        { k: 'Children',  label: 'Children (comma-separated)', type: 'text' },
      ]
    },
    { key: 'counseling', name: 'Counseling', api: 'counseling', idField: 'Title',
      listCols: ['Title', 'Definition'],
      fields: [
        { k: 'Title',      label: 'Title',                       type: 'text',     required: true },
        { k: 'Color',      label: 'Color (hex, e.g. #6366f1)',   type: 'text' },
        { k: 'Icon',       label: 'Icon (emoji)',                type: 'text' },
        { k: 'Definition', label: 'Definition',                  type: 'textarea' },
        { k: 'Scriptures', label: 'Scriptures',                  type: 'textarea' },
        { k: 'Steps',      label: 'Steps (semicolon-separated)', type: 'textarea' },
      ]
    },
    { key: 'devotionals', name: 'Devotionals', api: 'devotionals', idField: 'Date',
      listCols: ['Date', 'Title', 'Theme'],
      fields: [
        { k: 'Date',       label: 'Date (YYYY-MM-DD)',      type: 'text',     required: true },
        { k: 'Title',      label: 'Title',                  type: 'text',     required: true },
        { k: 'Scripture',  label: 'Scripture Reference',    type: 'text' },
        { k: 'Theme',      label: 'Theme',                  type: 'text' },
        { k: 'Reflection', label: 'Reflection',             type: 'textarea' },
        { k: 'Prayer',     label: 'Prayer',                 type: 'textarea' },
        { k: 'Question',   label: 'Reflection Question',    type: 'textarea' },
      ]
    },
    { key: 'reading', name: 'Reading Plan', api: 'reading', idField: '_rowIndex',
      listCols: ['_rowIndex', 'Old Testament', 'New Testament'],
      fields: [
        { k: '_rowIndex',     label: 'Day # (1\u2013365)', type: 'number',   required: true },
        { k: 'Old Testament', label: 'Old Testament',      type: 'text' },
        { k: 'New Testament', label: 'New Testament',      type: 'text' },
        { k: 'Psalms',        label: 'Psalms',             type: 'text' },
        { k: 'Proverbs',      label: 'Proverbs',           type: 'text' },
      ]
    },
    { key: 'words', name: 'Lexicon', api: 'words', idField: 'Original',
      listCols: ['Original', 'English', 'Category'],
      fields: [
        { k: 'Original',    label: 'Original Word (Hebrew/Greek)', type: 'text',     required: true },
        { k: 'English',     label: 'English Translation',          type: 'text' },
        { k: 'Definition',  label: 'Definition',                   type: 'textarea' },
        { k: 'Category',    label: 'Category',                     type: 'text' },
        { k: 'Testament',   label: 'Testament',                    type: 'select',   opts: ['Old', 'New'] },
        { k: 'Usage Count', label: 'Usage Count',                  type: 'number' },
        { k: 'Question ID', label: 'Question ID',                  type: 'text' },
      ]
    },
    { key: 'heart', name: 'Heart Check', api: 'heart', idField: 'Question ID',
      listCols: ['Question ID', 'Category', 'Question'],
      fields: [
        { k: 'Question ID',  label: 'Question ID', type: 'text',     required: true },
        { k: 'Category',     label: 'Category',    type: 'text' },
        { k: 'Question',     label: 'Question',    type: 'textarea', required: true },
        { k: 'Scripture',    label: 'Scripture',   type: 'text' },
        { k: 'Prescription', label: 'Prescription',type: 'textarea' },
      ]
    },
    { key: 'mirror', name: 'Mirror', api: 'mirror', idField: 'Category Title',
      listCols: ['Category Title', 'Chart Label'],
      fields: [
        { k: 'Category Title', label: 'Category Title', type: 'text',     required: true },
        { k: 'Category Intro', label: 'Category Intro', type: 'textarea' },
        { k: 'Chart Label',    label: 'Chart Label',    type: 'text' },
        { k: 'Content',        label: 'Content',        type: 'textarea' },
      ]
    },
    { key: 'quiz', name: 'Quiz', api: 'quiz', idField: 'Question',
      listCols: ['Category', 'Question', 'Difficulty'],
      fields: [
        { k: 'Question',       label: 'Question',            type: 'textarea', required: true },
        { k: 'Category',       label: 'Category',            type: 'text' },
        { k: 'Difficulty',     label: 'Difficulty',          type: 'select',   opts: ['Easy', 'Medium', 'Hard'] },
        { k: 'Option A',       label: 'Option A',            type: 'text',     required: true },
        { k: 'Option B',       label: 'Option B',            type: 'text',     required: true },
        { k: 'Option C',       label: 'Option C',            type: 'text' },
        { k: 'Option D',       label: 'Option D',            type: 'text' },
        { k: 'Correct Answer', label: 'Correct Answer',      type: 'select',   opts: ['A', 'B', 'C', 'D'] },
        { k: 'Reference',      label: 'Scripture Reference', type: 'text' },
      ]
    },
    { key: 'apologetics', name: 'Apologetics', api: 'apologetics', idField: 'Short Title',
      listCols: ['Category Title', 'Short Title'],
      fields: [
        { k: 'Category Title', label: 'Category Title',    type: 'text',     required: true },
        { k: 'Category Intro', label: 'Category Intro',    type: 'textarea' },
        { k: 'Short Title',    label: 'Short Title',       type: 'text',     required: true },
        { k: 'Quote Text',     label: 'Quote / Objection', type: 'textarea' },
        { k: 'Reference Text', label: 'Scripture',         type: 'text' },
        { k: 'Answer Content', label: 'Answer / Response', type: 'textarea' },
      ]
    },
  ];

  // ── Private helpers ───────────────────────────────────────────────────────

  function _getTab(key) {
    return TABS.find(function(t) { return t.key === key; }) || TABS[0];
  }

  function _fieldId(f) {
    return 'tt-fld-' + f.k.replace(/[^a-zA-Z0-9]/g, '_');
  }

  function _renderField(f, val) {
    var INP = 'width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg-raised);color:var(--ink);font-size:0.9rem;font-family:inherit;';
    var fid = _fieldId(f);
    var v   = (val !== undefined && val !== null) ? val : '';
    var lbl = '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-bottom:5px;">'
            + _e(f.label) + (f.required ? ' <span style="color:var(--danger);">*</span>' : '') + '</label>';
    var inp;
    if (f.type === 'textarea') {
      inp = '<textarea id="' + fid + '" rows="4" placeholder="' + _e(f.label) + '\u2026" style="' + INP + 'resize:vertical;line-height:1.6;">' + _e(v) + '</textarea>';
    } else if (f.type === 'select') {
      inp = '<select id="' + fid + '" style="' + INP + '"><option value="">\u2014 select \u2014</option>';
      (f.opts || []).forEach(function(o) {
        inp += '<option value="' + _e(o) + '"' + (String(o) === String(v) ? ' selected' : '') + '>' + _e(o) + '</option>';
      });
      inp += '</select>';
    } else if (f.type === 'number') {
      inp = '<input type="number" id="' + fid + '" value="' + _e(v) + '" placeholder="' + _e(f.label) + '" style="' + INP + '" />';
    } else {
      inp = '<input type="text" id="' + fid + '" value="' + _e(v) + '" placeholder="' + _e(f.label) + '" style="' + INP + '" />';
    }
    return '<div style="margin-bottom:14px;">' + lbl + inp + '</div>';
  }

  function _readField(f) {
    var el = document.getElementById(_fieldId(f));
    return el ? el.value : '';
  }

  // ── Public: open add/edit modal ────────────────────────────────────────────

  function openEditor(item, tabKey) {
    var tab   = _getTab(tabKey || _tab);
    var isNew = !item;
    var title = isNew ? ('Add \u2014 ' + tab.name) : ('Edit \u2014 ' + _e(String(item[tab.idField] || 'Row')));

    var fieldsHtml = tab.fields.map(function(f) {
      return _renderField(f, item ? item[f.k] : '');
    }).join('');

    var existing = document.getElementById('tt-modal');
    if (existing) existing.remove();

    var html = '<div id="tt-modal" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);padding:16px;">'
      + '<div style="background:var(--bg-raised,#ffffff);border-radius:16px;width:100%;max-width:580px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.4);">'
      + '<div style="padding:20px 22px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;">'
      + '<div style="flex:1;font-size:1.05rem;font-weight:800;color:var(--ink);">' + title + '</div>'
      + '<button onclick="document.getElementById(\'tt-modal\').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--ink-muted);line-height:1;padding:0;">&times;</button>'
      + '</div>'
      + '<div style="flex:1;overflow-y:auto;padding:20px 22px;">';

    if (!isNew) {
      html += '<input type="hidden" id="tt-orig-id" value="' + _e(String(item[tab.idField] || '')) + '" />';
    }
    html += fieldsHtml;
    html += '</div>'
      + '<div style="padding:14px 22px;border-top:1px solid var(--line);display:flex;gap:10px;justify-content:flex-end;">'
      + '<button onclick="document.getElementById(\'tt-modal\').remove()" style="padding:10px 20px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font-size:0.88rem;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>'
      + '<button onclick="TheTruth.save(\'' + tab.key + '\',' + (isNew ? 'true' : 'false') + ')" style="padding:10px 22px;border-radius:10px;border:none;background:var(--accent);color:var(--ink-inverse);font-size:0.88rem;font-weight:700;cursor:pointer;font-family:inherit;">&#10003; Save</button>'
      + '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  }

  // ── Public: save (create or update) ───────────────────────────────────────

  async function save(tabKey, isNew) {
    var tab  = _getTab(tabKey);
    var data = {};
    for (var fi = 0; fi < tab.fields.length; fi++) {
      var f = tab.fields[fi];
      var v = _readField(f);
      if (f.required && !String(v).trim()) { _toast(f.label + ' is required.', 'warn'); return; }
      data[f.k] = v;
    }

    if (!isNew) {
      var origEl = document.getElementById('tt-orig-id');
      if (origEl) data['_origId'] = origEl.value;
    }

    var action = 'app.' + tab.api + (isNew ? '.create' : '.update');
    try {
      await TheVine.flock.call(action, data);
      var modal = document.getElementById('tt-modal');
      if (modal) modal.remove();
      if (typeof Modules !== 'undefined' && Modules._dataCache) delete Modules._dataCache['ca-' + tab.key];
      delete _allRows[tab.key];   // force fresh fetch on next render
      _toast((isNew ? 'Created' : 'Updated') + ' successfully.', 'success');
      var panel = document.querySelector('.tt-panel[data-key="' + tab.key + '"]');
      if (panel) renderList(panel, tab.key);
    } catch (e) {
      _toast('Save failed: ' + (e.message || e), 'danger');
    }
  }

  // ── Public: delete ─────────────────────────────────────────────────────────

  async function del(tabKey, idEncoded) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    var tab   = _getTab(tabKey);
    var idVal = decodeURIComponent(idEncoded);
    var body  = {};
    body[tab.idField] = idVal;
    try {
      await TheVine.flock.call('app.' + tab.api + '.delete', body);
      if (typeof Modules !== 'undefined' && Modules._dataCache) delete Modules._dataCache['ca-' + tab.key];
      delete _allRows[tab.key];   // force fresh fetch on next render
      _toast('Deleted.', 'success');
      var panel = document.querySelector('.tt-panel[data-key="' + tab.key + '"]');
      if (panel) renderList(panel, tab.key);
    } catch (e) {
      _toast('Delete failed: ' + (e.message || e), 'danger');
    }
  }

  // ── Private: pagination controls HTML ─────────────────────────────────────

  function _paginationHtml(tabKey, pg, totalPages) {
    var BTN   = 'padding:6px 14px;border-radius:8px;border:1px solid var(--line);background:var(--bg-raised);color:var(--ink);font-size:0.82rem;font-weight:600;cursor:pointer;font-family:inherit;';
    var ACBTN = 'padding:6px 14px;border-radius:8px;border:1px solid var(--accent);background:var(--accent);color:var(--ink-inverse);font-size:0.82rem;font-weight:700;cursor:pointer;font-family:inherit;';
    var html = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;padding:16px 0 4px;flex-wrap:wrap;">';

    // Prev
    if (pg <= 1) {
      html += '<button disabled style="' + BTN + 'opacity:0.35;cursor:default;">&larr; Prev</button>';
    } else {
      html += '<button onclick="TheTruth.goPage(\'' + tabKey + '\',' + (pg - 1) + ')" style="' + BTN + '">&larr; Prev</button>';
    }

    // Page number buttons with ellipsis
    var pages = [];
    if (totalPages <= 7) {
      for (var i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (pg > 3) pages.push('…');
      var lo = Math.max(2, pg - 1), hi = Math.min(totalPages - 1, pg + 1);
      for (var j = lo; j <= hi; j++) pages.push(j);
      if (pg < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    pages.forEach(function(p) {
      if (p === '…') {
        html += '<span style="color:var(--ink-muted);padding:0 2px;">…</span>';
      } else {
        html += '<button onclick="TheTruth.goPage(\'' + tabKey + '\',' + p + ')" style="' + (p === pg ? ACBTN : BTN) + '">' + p + '</button>';
      }
    });

    // Next
    if (pg >= totalPages) {
      html += '<button disabled style="' + BTN + 'opacity:0.35;cursor:default;">Next &rarr;</button>';
    } else {
      html += '<button onclick="TheTruth.goPage(\'' + tabKey + '\',' + (pg + 1) + ')" style="' + BTN + '">Next &rarr;</button>';
    }

    html += '</div>';
    return html;
  }

  // ── Private: render a row set into container ───────────────────────────────
  // rows      = the rows to display (page slice or filtered set)
  // totalAll  = total unfiltered count (for the search placeholder and count line)
  // pg        = current page (1-based); null when rendering a filtered result set
  // totalPages= total pages (or 0 when rendering filtered results)

  function _renderRows(container, tab, rows, totalAll, pg, totalPages) {
    if (!rows.length) {
      container.innerHTML = _empty('&#9998;', 'No items yet', 'Click \u201C+ Add ' + tab.name + '\u201D to create the first entry.');
      return;
    }

    var countLabel = (pg != null)
      ? (rows.length + ' item' + (rows.length !== 1 ? 's' : '') + (totalPages > 1 ? ' \u2014 page ' + pg + ' of ' + totalPages : ''))
      : (rows.length + ' result' + (rows.length !== 1 ? 's' : '') + ' of ' + totalAll);

    var html = '<div class="browse-search" style="margin-bottom:10px;">'
      + '<span class="browse-search-icon">&#128269;</span>'
      + '<input type="text" id="tt-search-' + tab.key + '" class="browse-search-input" '
      + 'placeholder="Search ' + totalAll + ' items\u2026" '
      + 'oninput="TheTruth.filter(this.value,\'' + tab.key + '\')">'
      + '</div>'
      + '<div style="font-size:0.75rem;color:var(--ink-muted);margin-bottom:8px;">' + countLabel + '</div>';

    html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.84rem;" id="tt-table-' + tab.key + '">';
    html += '<thead><tr style="background:var(--bg-sunken);">';
    tab.listCols.forEach(function(col) {
      var lbl = col === '_rowIndex' ? 'Day #' : col;
      html += '<th style="padding:9px 12px;text-align:left;font-weight:700;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);white-space:nowrap;border-bottom:1px solid var(--line);">' + _e(lbl) + '</th>';
    });
    html += '<th style="padding:9px 12px;text-align:right;font-weight:700;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);border-bottom:1px solid var(--line);">Actions</th>';
    html += '</tr></thead><tbody>';

    rows.forEach(function(row, idx) {
      var idVal   = String(row[tab.idField] || idx);
      var idEnc   = encodeURIComponent(idVal);
      var rowJson = _e(JSON.stringify(row));

      html += '<tr class="tt-row" '
        + 'style="border-bottom:1px solid var(--line);transition:background 0.15s;" '
        + 'onmouseenter="this.style.background=\'var(--bg-raised)\'" onmouseleave="this.style.background=\'\'">';
      tab.listCols.forEach(function(col) {
        var v = String(row[col] || '');
        if (col !== '_rowIndex' && v.length > 65) v = v.substring(0, 62) + '\u2026';
        html += '<td style="padding:9px 12px;color:var(--ink);vertical-align:middle;">' + _e(v) + '</td>';
      });
      html += '<td style="padding:9px 12px;text-align:right;white-space:nowrap;vertical-align:middle;">'
        + '<button data-row="' + rowJson + '" data-tab="' + tab.key + '" onclick="TheTruth.editFromTable(this)" '
        + 'style="padding:5px 12px;border-radius:7px;border:1px solid var(--accent);color:var(--accent);background:transparent;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;margin-right:6px;">Edit</button>'
        + '<button onclick="TheTruth.del(\'' + _e(tab.key) + '\',\'' + _e(idEnc) + '\')" '
        + 'style="padding:5px 12px;border-radius:7px;border:1px solid var(--danger,#e05);color:var(--danger,#e05);background:transparent;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;">Delete</button>'
        + '</td></tr>';
    });

    html += '</tbody></table></div>';

    // Pagination controls (only when showing a page slice, not filtered results)
    if (pg != null && totalPages > 1) {
      html += _paginationHtml(tab.key, pg, totalPages);
    }

    container.innerHTML = html;

    // Restore search query if user was filtering before a refresh
    var srchEl = document.getElementById('tt-search-' + tab.key);
    if (srchEl && _filterQuery[tab.key]) srchEl.value = _filterQuery[tab.key];
  }

  // ── Public: render list (lazy-loaded per tab, paginated) ─────────────────

  async function renderList(container, tabKey, page) {
    var tab = _getTab(tabKey);
    var pg  = (page != null) ? page : (_pages[tab.key] || 1);
    _pages[tab.key] = pg;

    // Fetch and cache all rows if not already loaded
    if (!_allRows[tab.key]) {
      container.innerHTML = _spinner();
      try {
        var apiMethod = TheVine.app[tab.api];
        if (typeof apiMethod !== 'function') throw new Error('API method not found: ' + tab.api);
        var raw = await apiMethod();
        _allRows[tab.key] = _rows(raw).map(function(r, i) {
          if (tab.key === 'reading') r['_rowIndex'] = String(i + 1);
          return r;
        });
      } catch (e) {
        container.innerHTML = _errHtml(e.message);
        return;
      }
    }

    var all        = _allRows[tab.key];
    var totalPages = Math.ceil(all.length / PAGE_SIZE);
    // Clamp page to valid range
    pg = Math.max(1, Math.min(pg, totalPages || 1));
    _pages[tab.key] = pg;

    var start    = (pg - 1) * PAGE_SIZE;
    var pageRows = all.slice(start, start + PAGE_SIZE);

    // If a filter is active, show filtered results instead of the page slice
    if (_filterQuery[tab.key]) {
      var q = _filterQuery[tab.key].toLowerCase();
      var filtered = all.filter(function(row) {
        return tab.listCols.some(function(col) { return String(row[col] || '').toLowerCase().includes(q); });
      });
      _renderRows(container, tab, filtered, all.length, null, null);
    } else {
      _renderRows(container, tab, pageRows, all.length, pg, totalPages);
    }
  }

  // ── Public: go to a specific page ─────────────────────────────────────────

  function goPage(tabKey, page) {
    _filterQuery[tabKey] = '';   // clear any active filter when navigating pages
    _pages[tabKey] = page;
    var panel = document.querySelector('.tt-panel[data-key="' + tabKey + '"]');
    if (panel) renderList(panel, tabKey, page);
  }

  // ── Public: edit from table row button ────────────────────────────────────

  function editFromTable(btn) {
    var tabKey = btn.dataset.tab;
    var row    = {};
    try { row = JSON.parse(btn.dataset.row); } catch (_) {}
    openEditor(row, tabKey);
  }

  // ── Filter query state (per tab) ──────────────────────────────────────────

  var _filterQuery = {};   // last search string per tab key

  // ── Public: filter ────────────────────────────────────────────────────────

  function filter(query, tabKey) {
    var key = tabKey || _tab;
    var q   = (query || '').trim();
    _filterQuery[key] = q;

    var tab   = _getTab(key);
    var all   = _allRows[key] || [];
    var panel = document.querySelector('.tt-panel[data-key="' + key + '"]');
    if (!panel) return;

    if (!q) {
      // Restore paginated view
      _renderRows(panel, tab, all.slice((_pages[key] - 1) * PAGE_SIZE, _pages[key] * PAGE_SIZE),
        all.length, _pages[key], Math.ceil(all.length / PAGE_SIZE));
      return;
    }

    var ql = q.toLowerCase();
    var filtered = all.filter(function(row) {
      return tab.listCols.some(function(col) {
        return String(row[col] || '').toLowerCase().includes(ql);
      });
    });
    _renderRows(panel, tab, filtered, all.length, null, null);

    // Restore the typed value (innerHTML wipes the input)
    var srchEl = document.getElementById('tt-search-' + key);
    if (srchEl && srchEl.value !== q) srchEl.value = q;
  }

  // ── Public: switch tab ────────────────────────────────────────────────────

  function switchTab(key) {
    _tab = key;
    document.querySelectorAll('.tt-tab-btn').forEach(function(btn) {
      var active = btn.dataset.key === key;
      btn.style.borderBottom = active ? '2px solid var(--accent)' : '2px solid transparent';
      btn.style.color        = active ? 'var(--accent)' : 'var(--ink-muted)';
      btn.style.fontWeight   = active ? '700' : '500';
    });
    var tab    = _getTab(key);
    var addBtn = document.getElementById('tt-add-btn');
    if (addBtn) addBtn.textContent = '+ Add ' + tab.name;
    document.querySelectorAll('.tt-panel').forEach(function(p) {
      p.style.display = (p.dataset.key === key) ? '' : 'none';
    });
    var panel = document.querySelector('.tt-panel[data-key="' + key + '"]');
    if (panel) {
      panel.dataset.loaded = '1';
      renderList(panel, key);
    }
  }

  // ── Public: current tab key ───────────────────────────────────────────────

  function currentTab() { return _tab; }

  // ── Module render (registered with Modules via _def) ──────────────────────

  async function render(el, session) {
    var s = session || (typeof TheVine !== 'undefined' ? TheVine.session() : null);
    var allowed = s && (TheVine.hasRole('admin') || TheVine.hasRole('pastor'));
    if (!allowed) {
      el.innerHTML = '<div style="text-align:center;padding:80px 20px;">'
        + '<div style="font-size:3rem;margin-bottom:12px;">&#128274;</div>'
        + '<p style="color:var(--ink-muted);">Pastor or Admin access required.</p></div>';
      return;
    }

    // Header
    var tab = _getTab(_tab);
    el.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:20px;">'
      + '<div>'
      + '<h1 style="font-size:1.4rem;font-weight:800;margin:0 0 2px;color:var(--ink);">&#9998; Content Editor</h1>'
      + '<p style="font-size:0.82rem;color:var(--ink-muted);margin:0;">Add, edit, and update every field across all Matthew APP content.</p>'
      + '</div>'
      + '<button id="tt-add-btn" onclick="TheTruth.openEditor(null,TheTruth.currentTab())" '
      + 'style="padding:9px 18px;border-radius:10px;border:none;background:var(--accent);color:var(--ink-inverse);'
      + 'font-size:0.85rem;font-weight:700;cursor:pointer;font-family:inherit;">+ Add ' + _e(tab.name) + '</button>'
      + '</div>';

    // Tab bar
    var tabBar = '<div style="display:flex;gap:2px;overflow-x:auto;padding-bottom:2px;border-bottom:1px solid var(--line);margin-bottom:16px;">';
    TABS.forEach(function(t) {
      var isActive = t.key === _tab;
      tabBar += '<button class="tt-tab-btn" data-key="' + t.key + '" onclick="TheTruth.switchTab(\'' + t.key + '\')" '
        + 'style="padding:9px 14px;border:none;border-bottom:' + (isActive ? '2px solid var(--accent)' : '2px solid transparent') + ';'
        + 'background:transparent;color:' + (isActive ? 'var(--accent)' : 'var(--ink-muted)') + ';'
        + 'font-weight:' + (isActive ? '700' : '500') + ';font-size:0.82rem;white-space:nowrap;cursor:pointer;font-family:inherit;margin-bottom:-1px;">'
        + _e(t.name) + '</button>';
    });
    tabBar += '</div>';

    // Panels (lazy-loaded)
    var panels = '';
    TABS.forEach(function(t) {
      panels += '<div class="tt-panel" data-key="' + t.key + '" style="display:' + (t.key === _tab ? 'block' : 'none') + ';"></div>';
    });

    el.innerHTML += tabBar + panels;

    // Load active tab immediately
    var initPanel = el.querySelector('.tt-panel[data-key="' + _tab + '"]');
    if (initPanel) {
      initPanel.dataset.loaded = '1';
      await renderList(initPanel, _tab);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    render,
    openEditor,
    save,
    del,
    renderList,
    editFromTable,
    filter,
    goPage,
    switchTab,
    currentTab,
  };

})();
