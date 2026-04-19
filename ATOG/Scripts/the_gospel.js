/* ═══════════════════════════════════════════════════════════════════════
 *  the_gospel.js  —  ATOG Data Layer
 *  "The Gospel" = the good news, the source of truth.
 *  Fetches all data from the FlockOS Master GAS API, caches in memory.
 * ═══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var API = 'https://script.google.com/macros/s/AKfycbx2pemG039LB609OlVY-OcqLWK75qRV2ZgZNyf4Oc7dGogCR2HC4C__iWUqlG9JfYLt/exec';

    /* ── In-memory cache ─────────────────────────────── */
    var _cache = {};
    var _inflight = {};

    /* ── Normalise API response to an array ──────────── */
    function _normalise(json) {
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.data)) return json.data;
        if (json && Array.isArray(json.rows)) return json.rows;
        return [];
    }

    /* ── Fetch a tab (deduped, cached) ───────────────── */
    function fetchTab(tab) {
        if (_cache[tab]) return Promise.resolve(_cache[tab]);
        if (_inflight[tab]) return _inflight[tab];

        var url = API + '?action=app.tab&tab=' + encodeURIComponent(tab) + '&_=' + Date.now();

        _inflight[tab] = fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('API ' + r.status);
                return r.json();
            })
            .then(function (json) {
                var rows = _normalise(json);
                _cache[tab] = rows;
                delete _inflight[tab];
                return rows;
            })
            .catch(function (err) {
                delete _inflight[tab];
                console.error('[Gospel] fetch error for tab "' + tab + '":', err);
                throw err;
            });

        return _inflight[tab];
    }

    /* ── Submit a prayer request (POST) ──────────────── */
    function submitPrayer(data) {
        var body = new URLSearchParams();
        body.append('action', 'prayer.request');
        body.append('submitterName', data.submitterName || '');
        body.append('submitterEmail', data.submitterEmail || '');
        body.append('submitterPhone', data.submitterPhone || '');
        body.append('prayerText', data.prayerText || '');
        body.append('category', data.category || 'General');

        return fetch(API, {
            method: 'POST',
            body: body
        }).then(function (r) { return r.json(); });
    }

    /* ── Convenience accessors (return promises) ─────── */
    function theology()    { return fetchTab('Theology'); }
    function books()       { return fetchTab('Books'); }
    function lexicon()     { return fetchTab('Words'); }
    function characters()  { return fetchTab('Genealogy'); }
    function counseling()  { return fetchTab('Counseling'); }
    function heart()       { return fetchTab('Heart'); }
    function mirror()      { return fetchTab('Mirror'); }
    function quiz()        { return fetchTab('Quiz'); }
    function apologetics() { return fetchTab('Apologetics'); }

    /* ── Prefetch common tabs ────────────────────────── */
    function prefetch() {
        ['Theology', 'Books', 'Words'].forEach(fetchTab);
    }

    /* ── Clear cache (for lang change or force refresh) ─ */
    function clearCache() {
        _cache = {};
        _inflight = {};
    }

    /* ── Public API ──────────────────────────────────── */
    window.Gospel = {
        API:           API,
        fetchTab:      fetchTab,
        submitPrayer:  submitPrayer,
        theology:      theology,
        books:         books,
        lexicon:       lexicon,
        characters:    characters,
        counseling:    counseling,
        heart:         heart,
        mirror:        mirror,
        quiz:          quiz,
        apologetics:   apologetics,
        prefetch:      prefetch,
        clearCache:    clearCache
    };

})();
