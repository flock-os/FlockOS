#!/usr/bin/env python3
"""Insert the Content Admin module into the_tabernacle.js."""

import re, sys

TARGET = '/Users/greg.granger/Desktop/FlockOS/Software/FlockOS/Scripts/the_tabernacle.js'
ANCHOR = '  // ── Background preload — warm caches before user clicks ──────────────'

MODULE_CODE = r"""
  // ═══════════════════════════════════════════════════════════════════════
  // CONTENT ADMIN  — Matthew APP content editor (admin / editor role only)
  //   Covers: Books, Genealogy, Counseling, Devotionals, Reading Plan,
  //           Lexicon, Heart Check, Mirror, Quiz, Apologetics
  // ═══════════════════════════════════════════════════════════════════════
  var _caTab   = 'books';
  var _caItems = [];

  var _CA_TABS = [
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
        { k: 'Title',      label: 'Title',                         type: 'text',     required: true },
        { k: 'Color',      label: 'Color (hex, e.g. #6366f1)',     type: 'text' },
        { k: 'Icon',       label: 'Icon (emoji)',                  type: 'text' },
        { k: 'Definition', label: 'Definition',                    type: 'textarea' },
        { k: 'Scriptures', label: 'Scriptures',                    type: 'textarea' },
        { k: 'Steps',      label: 'Steps (semicolon-separated)',   type: 'textarea' },
      ]
    },
    { key: 'devotionals', name: 'Devotionals', api: 'devotionals', idField: 'Date',
      listCols: ['Date', 'Title', 'Theme'],
      fields: [
        { k: 'Date',       label: 'Date (YYYY-MM-DD)',        type: 'text',     required: true },
        { k: 'Title',      label: 'Title',                    type: 'text',     required: true },
        { k: 'Scripture',  label: 'Scripture Reference',      type: 'text' },
        { k: 'Theme',      label: 'Theme',                    type: 'text' },
        { k: 'Reflection', label: 'Reflection',               type: 'textarea' },
        { k: 'Prayer',     label: 'Prayer',                   type: 'textarea' },
        { k: 'Question',   label: 'Reflection Question',      type: 'textarea' },
      ]
    },
    { key: 'reading', name: 'Reading Plan', api: 'reading', idField: '_rowIndex',
      listCols: ['_rowIndex', 'Old Testament', 'New Testament'],
      fields: [
        { k: '_rowIndex',     label: 'Day # (1\u2013365)',   type: 'number',   required: true },
        { k: 'Old Testament', label: 'Old Testament',        type: 'text' },
        { k: 'New Testament', label: 'New Testament',        type: 'text' },
        { k: 'Psalms',        label: 'Psalms',               type: 'text' },
        { k: 'Proverbs',      label: 'Proverbs',             type: 'text' },
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
        { k: 'Question ID',   label: 'Question ID',   type: 'text',     required: true },
        { k: 'Category',      label: 'Category',       type: 'text' },
        { k: 'Question',      label: 'Question',       type: 'textarea', required: true },
        { k: 'Scripture',     label: 'Scripture',      type: 'text' },
        { k: 'Prescription',  label: 'Prescription',   type: 'textarea' },
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

  function _caGetTab(key) {
    return _CA_TABS.find(function(t) { return t.key === key; }) || _CA_TABS[0];
  }

  function _caCurrentTab() { return _caTab; }

  function _caRenderField(f, val) {
    var INP = 'width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--bg-raised);color:var(--ink);font-size:0.9rem;font-family:inherit;';
    var fid = 'ca-fld-' + f.k.replace(/[^a-zA-Z0-9]/g, '_');
    var v   = (val !== undefined && val !== null) ? val : '';
    var lbl = '<label style="display:block;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);margin-bottom:5px;">'
            + _e(f.label) + (f.required ? ' <span style="color:var(--danger);">*</span>' : '') + '</label>';
    var inp = '';
    if (f.type === 'textarea') {
      inp = '<textarea id="' + fid + '" rows="4" placeholder="' + _e(f.label) + '\u2026" style="' + INP + 'resize:vertical;line-height:1.6;">' + _e(v) + '</textarea>';
    } else if (f.type === 'select') {
      inp = '<select id="' + fid + '" style="' + INP + '">'
          + '<option value="">\u2014 select \u2014</option>';
      (f.opts || []).forEach(function(o) {
        inp += '<option value="' + _e(o) + '"' + (o === v ? ' selected' : '') + '>' + _e(o) + '</option>';
      });
      inp += '</select>';
    } else if (f.type === 'number') {
      inp = '<input type="number" id="' + fid + '" value="' + _e(v) + '" placeholder="' + _e(f.label) + '" style="' + INP + '" />';
    } else {
      inp = '<input type="text" id="' + fid + '" value="' + _e(v) + '" placeholder="' + _e(f.label) + '" style="' + INP + '" />';
    }
    return '<div style="margin-bottom:14px;">' + lbl + inp + '</div>';
  }

  function _caReadField(f) {
    var fid = 'ca-fld-' + f.k.replace(/[^a-zA-Z0-9]/g, '_');
    var el  = document.getElementById(fid);
    return el ? el.value : '';
  }

  function _caOpenEditor(item, tabKey) {
    var tab   = _caGetTab(tabKey || _caTab);
    var isNew = !item;
    var title = isNew ? ('Add \u2014 ' + tab.name) : ('Edit \u2014 ' + _e(String(item[tab.idField] || 'Row')));

    var fieldsHtml = tab.fields.map(function(f) {
      return _caRenderField(f, item ? item[f.k] : '');
    }).join('');

    var existing = document.getElementById('ca-modal');
    if (existing) existing.remove();

    var html = '<div id="ca-modal" style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);padding:16px;">'
      + '<div style="background:var(--bg-card);border-radius:16px;width:100%;max-width:580px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.4);">'
      + '<div style="padding:20px 22px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px;">'
      + '<div style="flex:1;font-size:1.05rem;font-weight:800;color:var(--ink);">' + title + '</div>'
      + '<button onclick="document.getElementById(\'ca-modal\').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--ink-muted);line-height:1;padding:0;">&times;</button>'
      + '</div>'
      + '<div style="flex:1;overflow-y:auto;padding:20px 22px;">';

    if (!isNew) {
      html += '<input type="hidden" id="ca-orig-id" value="' + _e(String(item[tab.idField] || '')) + '" />';
    }
    html += fieldsHtml;
    html += '</div>'
      + '<div style="padding:14px 22px;border-top:1px solid var(--line);display:flex;gap:10px;justify-content:flex-end;">'
      + '<button onclick="document.getElementById(\'ca-modal\').remove()" style="padding:10px 20px;border-radius:10px;border:1px solid var(--line);background:transparent;color:var(--ink);font-size:0.88rem;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>'
      + '<button onclick="Modules._caSave(\'' + tab.key + '\',' + (isNew ? 'true' : 'false') + ')" style="padding:10px 22px;border-radius:10px;border:none;background:var(--accent);color:var(--ink-inverse);font-size:0.88rem;font-weight:700;cursor:pointer;font-family:inherit;">&#10003; Save</button>'
      + '</div></div></div>';

    document.body.insertAdjacentHTML('beforeend', html);
  }

  async function _caSave(tabKey, isNew) {
    var tab  = _caGetTab(tabKey);
    var data = {};
    var ok   = true;
    tab.fields.forEach(function(f) {
      var v = _caReadField(f);
      if (f.required && !v.trim()) { _toast(f.label + ' is required.', 'warn'); ok = false; }
      data[f.k] = v;
    });
    if (!ok) return;

    if (!isNew) {
      var origEl = document.getElementById('ca-orig-id');
      if (origEl) data['_origId'] = origEl.value;
    }

    var action = 'app.' + tab.api + (isNew ? '.create' : '.update');
    try {
      await TheVine.flock.call(action, data);
      var modal = document.getElementById('ca-modal');
      if (modal) modal.remove();
      delete _dataCache['ca-' + tab.key];
      _toast((isNew ? 'Created' : 'Updated') + ' successfully.', 'success');
      var panel = document.querySelector('.ca-panel[data-key="' + tab.key + '"]');
      if (panel) _caRenderList(panel, tab.key);
    } catch (e) {
      _toast('Save failed: ' + (e.message || e), 'danger');
    }
  }

  async function _caDelete(tabKey, idEncoded) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    var tab  = _caGetTab(tabKey);
    var idVal = decodeURIComponent(idEncoded);
    var body = {};
    body[tab.idField] = idVal;
    try {
      await TheVine.flock.call('app.' + tab.api + '.delete', body);
      delete _dataCache['ca-' + tab.key];
      _toast('Deleted.', 'success');
      var panel = document.querySelector('.ca-panel[data-key="' + tab.key + '"]');
      if (panel) _caRenderList(panel, tab.key);
    } catch (e) {
      _toast('Delete failed: ' + (e.message || e), 'danger');
    }
  }

  async function _caRenderList(container, tabKey) {
    var tab = _caGetTab(tabKey);
    container.innerHTML = _spinner();
    try {
      var apiMethod = TheVine.app[tab.api];
      if (typeof apiMethod !== 'function') throw new Error('API method not found: ' + tab.api);
      var raw  = await _fetch('ca-' + tab.key, function() { return apiMethod(); }, _TTL.ref);
      var rows = (Array.isArray(raw) ? raw : _rows(raw)).map(function(r, i) {
        if (tab.key === 'reading') r['_rowIndex'] = String(i + 1);
        return r;
      });
      _caItems = rows;

      if (!rows.length) {
        container.innerHTML = _empty('&#9998;', 'No items yet', 'Click \u201C+ Add ' + tab.name + '\u201D to create the first entry.');
        return;
      }

      var html = '<div class="browse-search" style="margin-bottom:10px;">'
        + '<span class="browse-search-icon">&#128269;</span>'
        + '<input type="text" class="browse-search-input" placeholder="Search ' + rows.length + ' items\u2026" oninput="Modules._caFilter(this.value)">'
        + '</div>'
        + '<div style="font-size:0.75rem;color:var(--ink-muted);margin-bottom:8px;">' + rows.length + ' item' + (rows.length !== 1 ? 's' : '') + '</div>';

      html += '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.84rem;" id="ca-table-' + tab.key + '">';
      html += '<thead><tr style="background:var(--bg-sunken);">';
      tab.listCols.forEach(function(col) {
        var lbl = col === '_rowIndex' ? 'Day #' : col;
        html += '<th style="padding:9px 12px;text-align:left;font-weight:700;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);white-space:nowrap;border-bottom:1px solid var(--line);">' + _e(lbl) + '</th>';
      });
      html += '<th style="padding:9px 12px;text-align:right;font-weight:700;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted);border-bottom:1px solid var(--line);">Actions</th>';
      html += '</tr></thead><tbody>';

      rows.forEach(function(row, idx) {
        var idVal     = String(row[tab.idField] || idx);
        var idEnc     = encodeURIComponent(idVal);
        var searchTxt = tab.listCols.map(function(c) { return row[c] || ''; }).join(' ').toLowerCase();
        var rowJson   = _e(JSON.stringify(row));

        html += '<tr class="ca-row" data-search="' + _e(searchTxt) + '" '
          + 'style="border-bottom:1px solid var(--line);transition:background 0.15s;" '
          + 'onmouseenter="this.style.background=\'var(--bg-raised)\'" onmouseleave="this.style.background=\'\'">';
        tab.listCols.forEach(function(col) {
          var v = String(row[col] || '');
          if (col !== '_rowIndex' && v.length > 65) v = v.substring(0, 62) + '\u2026';
          html += '<td style="padding:9px 12px;color:var(--ink);vertical-align:middle;">' + _e(v) + '</td>';
        });
        html += '<td style="padding:9px 12px;text-align:right;white-space:nowrap;vertical-align:middle;">'
          + '<button data-row="' + rowJson + '" data-tab="' + tab.key + '" onclick="Modules._caEditFromTable(this)" '
          + 'style="padding:5px 12px;border-radius:7px;border:1px solid var(--accent);color:var(--accent);background:transparent;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;margin-right:6px;">Edit</button>'
          + '<button onclick="Modules._caDelete(\'' + _e(tab.key) + '\',\'' + _e(idEnc) + '\')" '
          + 'style="padding:5px 12px;border-radius:7px;border:1px solid var(--danger,#e05);color:var(--danger,#e05);background:transparent;font-size:0.78rem;font-weight:700;cursor:pointer;font-family:inherit;">Delete</button>'
          + '</td></tr>';
      });

      html += '</tbody></table></div>';
      container.innerHTML = html;
    } catch (e) {
      container.innerHTML = _errHtml(e.message);
    }
  }

  function _caEditFromTable(btn) {
    var tabKey = btn.dataset.tab;
    var row    = {};
    try { row = JSON.parse(btn.dataset.row); } catch (_) {}
    _caOpenEditor(row, tabKey);
  }

  function _caFilter(query) {
    var q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.ca-row').forEach(function(row) {
      row.style.display = (!q || (row.dataset.search || '').includes(q)) ? '' : 'none';
    });
  }

  function _caSwitchTab(key) {
    _caTab = key;
    document.querySelectorAll('.ca-tab-btn').forEach(function(btn) {
      var active = btn.dataset.key === key;
      btn.style.borderBottom   = active ? '2px solid var(--accent)' : '2px solid transparent';
      btn.style.color          = active ? 'var(--accent)' : 'var(--ink-muted)';
      btn.style.fontWeight     = active ? '700' : '500';
    });
    var tab    = _caGetTab(key);
    var addBtn = document.getElementById('ca-add-btn');
    if (addBtn) addBtn.textContent = '+ Add ' + tab.name;
    document.querySelectorAll('.ca-panel').forEach(function(p) {
      p.style.display = (p.dataset.key === key) ? '' : 'none';
    });
    var panel = document.querySelector('.ca-panel[data-key="' + key + '"]');
    if (panel && !panel.dataset.loaded) {
      panel.dataset.loaded = '1';
      _caRenderList(panel, key);
    }
  }

  _def('content-admin', async (el, session) => {
    var s = session || (typeof TheVine !== 'undefined' ? TheVine.session() : null);
    if (!s || (!TheVine.hasRole('admin') && !TheVine.hasRole('editor') && !TheVine.hasRole('staff'))) {
      el.innerHTML = '<div style="text-align:center;padding:80px 20px;">'
        + '<div style="font-size:3rem;margin-bottom:12px;">&#128274;</div>'
        + '<p style="color:var(--ink-muted);">Admin or editor access required.</p></div>';
      return;
    }

    _shell(el, '&#9998; Content Editor',
      'Add, edit, and update every field across all Matthew APP content types.',
      '<button id="ca-add-btn" onclick="Modules._caOpenEditor(null,Modules._caCurrentTab())" '
      + 'style="padding:9px 18px;border-radius:10px;border:none;background:var(--accent);color:var(--ink-inverse);'
      + 'font-size:0.85rem;font-weight:700;cursor:pointer;font-family:inherit;">+ Add '
      + _caGetTab(_caTab).name + '</button>');

    // ── Tab bar ──
    var tabBar = '<div style="display:flex;gap:2px;overflow-x:auto;padding-bottom:2px;border-bottom:1px solid var(--line);margin-bottom:16px;">';
    _CA_TABS.forEach(function(tab) {
      var isActive = tab.key === _caTab;
      tabBar += '<button class="ca-tab-btn" data-key="' + tab.key + '" onclick="Modules._caSwitchTab(\'' + tab.key + '\')" '
        + 'style="padding:9px 14px;border:none;border-bottom:' + (isActive ? '2px solid var(--accent)' : '2px solid transparent') + ';'
        + 'background:transparent;color:' + (isActive ? 'var(--accent)' : 'var(--ink-muted)') + ';'
        + 'font-weight:' + (isActive ? '700' : '500') + ';font-size:0.82rem;white-space:nowrap;cursor:pointer;font-family:inherit;margin-bottom:-1px;">'
        + _e(tab.name) + '</button>';
    });
    tabBar += '</div>';

    // ── Tab panels (lazy-loaded) ──
    var panels = '';
    _CA_TABS.forEach(function(tab) {
      panels += '<div class="ca-panel" data-key="' + tab.key + '" style="display:' + (tab.key === _caTab ? 'block' : 'none') + ';"></div>';
    });

    _body(el, tabBar + panels);

    // Load active tab immediately
    var initPanel = el.querySelector('.ca-panel[data-key="' + _caTab + '"]');
    if (initPanel) {
      initPanel.dataset.loaded = '1';
      await _caRenderList(initPanel, _caTab);
    }
  });

"""

with open(TARGET, 'r', encoding='utf-8') as f:
    content = f.read()

if ANCHOR not in content:
    print(f'ERROR: Anchor not found in file.')
    sys.exit(1)

if '_def(\'content-admin\'' in content:
    print('Content admin module already exists — skipping insertion.')
    sys.exit(0)

content = content.replace(ANCHOR, MODULE_CODE + '\n' + ANCHOR, 1)

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done. Content admin module inserted.')
