/* ═══════════════════════════════════════════════════════════════════════
 *  the_touch.js  —  ATOG Module Renderer
 *  "A Touch" = how the Gospel is presented to the world.
 *  Renders each section into its #view-* container.
 *  Uses classes from the_garment.css — zero Tailwind dependency.
 * ═══════════════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    var _rendered = {};
    var _charts   = {};

    /* ── Helpers ──────────────────────────────────────── */
    function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
    function trunc(s, n) { s = s || ''; return s.length > n ? s.substring(0, n) + '\u2026' : s; }

    function loader(msg) {
        return '<div class="loader"><div class="spinner"></div><span>' + esc(msg || 'Loading\u2026') + '</span></div>';
    }

    function sectionHead(title, subtitle) {
        return '<div class="section-header">' +
            '<h2>' + esc(title) + '</h2>' +
            '<div class="accent-line"></div>' +
            '<p>' + esc(subtitle) + '</p>' +
        '</div>';
    }

    function errMsg(section) {
        return '<div class="text-center py-16">' +
            '<p class="text-slate-500 text-lg">Unable to load ' + esc(section) + '.</p>' +
            '<p class="text-slate-600 text-sm mt-2">Check your connection and try again.</p>' +
            '<button onclick="location.reload()" class="btn btn-ghost mt-4" style="font-size:0.85rem; padding:0.5rem 1.25rem;">Reload</button>' +
        '</div>';
    }

    /* ══════════════════════════════════════════════════════
     *  RENDER DISPATCHER
     * ══════════════════════════════════════════════════════ */
    function render(viewName) {
        if (_rendered[viewName]) return;
        var el = document.getElementById('view-' + viewName);
        if (!el) return;
        var fn = renderers[viewName];
        if (fn) { el.innerHTML = loader(); fn(el); }
    }

    function onLangChange() {
        _rendered = {};
        Object.keys(_charts).forEach(function (k) { _charts[k].destroy(); delete _charts[k]; });
        var active = document.querySelector('.module-view.active');
        if (active) {
            var name = active.id.replace('view-', '');
            if (renderers[name]) { active.innerHTML = loader(); renderers[name](active); }
        }
    }

    /* ══════════════════════════════════════════════════════
     *  HOME CARDS
     * ══════════════════════════════════════════════════════ */
    function renderHomeCards() {
        var el = document.getElementById('home-cards');
        if (!el) return;
        var cards = [
            { view:'theology',    icon:'&#128220;', title:'Theology',           desc:'Systematic categories and doctrinal deep-dives.' },
            { view:'books',       icon:'&#128214;', title:'Books of the Bible', desc:'66 books with summaries, genres, and core theology.' },
            { view:'lexicon',     icon:'&#128300;', title:'Greek & Hebrew',     desc:'Strong\'s concordance with definitions and nuance.' },
            { view:'characters',  icon:'&#128101;', title:'Bible Characters',   desc:'Genealogy, bios, and lineage connections.' },
            { view:'counseling',  icon:'&#128156;', title:'Counseling',         desc:'Biblical frameworks for life\'s hardest questions.' },
            { view:'heart',       icon:'&#10084;&#65039;', title:'Heart Check', desc:'Self-assessment radar chart for spiritual health.' },
            { view:'mirror',      icon:'&#129668;', title:'The Mirror',         desc:'Reflect on where you stand across biblical categories.' },
            { view:'quiz',        icon:'&#127919;', title:'Bible Quiz',         desc:'Test your knowledge across difficulty levels.' },
            { view:'apologetics', icon:'&#9961;',   title:'Apologetics',        desc:'Answers to the toughest questions about the faith.' },
            { view:'prayer',      icon:'&#128591;', title:'Prayer Request',     desc:'Submit a prayer — our team will intercede for you.' }
        ];
        el.innerHTML = cards.map(function (c) {
            return '<div class="glass-card p-6 cursor-pointer" onclick="ATOG.navigate(\'' + c.view + '\')">' +
                '<div class="text-3xl mb-3">' + c.icon + '</div>' +
                '<h3 class="font-serif text-lg font-bold text-white mb-1">' + c.title + '</h3>' +
                '<p class="text-sm text-slate-400 leading-relaxed">' + c.desc + '</p>' +
            '</div>';
        }).join('');
        /* Make it a responsive grid */
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        el.style.gap = '1.25rem';
    }

    /* ══════════════════════════════════════════════════════
     *  SECTION RENDERERS
     * ══════════════════════════════════════════════════════ */
    var renderers = {};

    /* ── 1. THEOLOGY ──────────────────────────────────── */
    renderers.theology = function (el) {
        Gospel.theology().then(function (rows) {
            var cats = {};
            rows.forEach(function (r) {
                var cid = r.categoryId || r.category_id || 'other';
                if (!cats[cid]) cats[cid] = { title: r.categoryTitle || r.category_title || cid, intro: r.categoryIntro || r.category_intro || '', sections: [] };
                cats[cid].sections.push(r);
            });

            var html = sectionHead('Theology', 'Systematic categories and doctrinal deep-dives from Scripture.');
            html += '<div class="space-y-4">';
            Object.keys(cats).forEach(function (cid, i) {
                var cat = cats[cid];
                html += '<details class="glass-card-static overflow-hidden" ' + (i === 0 ? 'open' : '') + '>' +
                    '<summary class="p-5 flex justify-between items-center select-none">' +
                        '<div><h3 class="font-serif text-lg font-bold text-white">' + esc(cat.title) + '</h3>' +
                        '<p class="text-sm text-slate-400 mt-1">' + esc(trunc(cat.intro, 120)) + '</p></div>' +
                        '<span class="text-slate-500 text-xl" style="transition:transform 0.2s;">&#43;</span>' +
                    '</summary>' +
                    '<div class="px-5 pb-5 space-y-3">';
                cat.sections.forEach(function (s) {
                    html += '<div class="glass-subtle p-4">' +
                        '<h4 class="font-semibold text-neon-blue text-sm mb-1">' + esc(s.sectionTitle || s.section_title || '') + '</h4>' +
                        '<p class="text-slate-300 text-sm leading-relaxed">' + esc(s.content || '') + '</p>' +
                    '</div>';
                });
                html += '</div></details>';
            });
            html += '</div>';
            el.innerHTML = html;
            _rendered.theology = true;
        }).catch(function () { el.innerHTML = errMsg('Theology'); });
    };

    /* ── 2. BOOKS OF THE BIBLE ───────────────────────── */
    renderers.books = function (el) {
        Gospel.books().then(function (rows) {
            var html = sectionHead('Books of the Bible', '66 books — summaries, genres, core theology, and practical application.');

            /* Genre filter chips */
            var genres = {};
            rows.forEach(function (r) { if (r.genre) genres[r.genre] = true; });
            html += '<div class="flex flex-wrap justify-center gap-2 mb-6">' +
                '<button class="lang-btn active" data-genre="all" onclick="Touch._filterBooks(\'all\')">All</button>';
            Object.keys(genres).sort().forEach(function (g) {
                html += '<button class="lang-btn" data-genre="' + esc(g) + '" onclick="Touch._filterBooks(\'' + esc(g) + '\')">' + esc(g) + '</button>';
            });
            html += '</div>';

            /* Genre chart */
            html += '<div class="glass-card-static p-6 mb-8"><div class="chart-box"><canvas id="chart-book-genres"></canvas></div></div>';

            /* Book grid */
            html += '<div id="books-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">';
            rows.forEach(function (r) {
                var tColor = (r.testament || '').toLowerCase() === 'old' ? '--neon-gold' : '--neon-teal';
                html += '<div class="glass-card p-5 book-card" data-genre="' + esc(r.genre || '') + '">' +
                    '<div class="flex justify-between items-start mb-2">' +
                        '<h3 class="font-serif text-base font-bold text-white">' + esc(r.bookName || r.book_name || '') + '</h3>' +
                        '<span class="pill uppercase tracking-wider font-bold" style="color:var(' + tColor + ');">' + esc(r.testament || '') + '</span>' +
                    '</div>' +
                    '<span class="pill mb-3">' + esc(r.genre || '') + '</span>' +
                    '<p class="text-sm text-slate-300 leading-relaxed mb-3">' + esc(trunc(r.summary || '', 180)) + '</p>' +
                    (r.coreTheology ? '<p class="text-xs text-neon-purple"><strong>Core Theology:</strong> ' + esc(trunc(r.coreTheology || r.core_theology || '', 140)) + '</p>' : '') +
                '</div>';
            });
            html += '</div>';
            el.innerHTML = html;
            _rendered.books = true;
            _buildGenreChart(rows);
        }).catch(function () { el.innerHTML = errMsg('Books'); });
    };

    function _filterBooks(genre) {
        document.querySelectorAll('[data-genre].lang-btn').forEach(function (b) {
            b.classList.toggle('active', b.dataset.genre === genre);
        });
        document.querySelectorAll('.book-card').forEach(function (c) {
            c.style.display = (genre === 'all' || c.dataset.genre === genre) ? '' : 'none';
        });
    }

    function _buildGenreChart(rows) {
        var gc = {};
        rows.forEach(function (r) { var g = r.genre || 'Other'; gc[g] = (gc[g] || 0) + 1; });
        var labels = Object.keys(gc), data = labels.map(function (l) { return gc[l]; });
        var colors = ['#38bdf8','#c084fc','#2dd4bf','#f6d87a','#ff4040','#818cf8','#fb923c','#a3e635','#f472b6'];
        var ctx = document.getElementById('chart-book-genres');
        if (!ctx) return;
        if (_charts['book-genres']) _charts['book-genres'].destroy();
        _charts['book-genres'] = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: labels, datasets: [{ data: data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] },
            options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 11 } } } } }
        });
    }

    /* ── 3. LEXICON ───────────────────────────────────── */
    renderers.lexicon = function (el) {
        Gospel.lexicon().then(function (rows) {
            var html = sectionHead('Greek & Hebrew Lexicon', 'Explore the original languages of Scripture — Strong\'s numbers, definitions, nuance, and usage.');

            html += '<div class="mb-6"><input type="text" id="lexicon-search" placeholder="Search by word, Strong\u2019s number, or definition\u2026" ' +
                'class="input" oninput="Touch._filterLexicon(this.value)"></div>';

            html += '<div id="lexicon-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1rem;">';
            rows.forEach(function (r) {
                var tColor = (r.testament || '').toLowerCase() === 'old' ? '--neon-gold' : '--neon-teal';
                html += '<div class="glass-card p-5 lex-card" data-search="' + esc((r.strongs + ' ' + r.original + ' ' + r.english + ' ' + r.definition + ' ' + r.theme).toLowerCase()) + '">' +
                    '<div class="flex justify-between items-start mb-2">' +
                        '<div>' +
                            '<span class="font-mono text-xs text-slate-500">' + esc(r.strongs || '') + '</span>' +
                            '<h3 class="font-serif text-lg font-bold text-white">' + esc(r.original || '') + '</h3>' +
                            '<span class="text-sm text-neon-blue">' + esc(r.english || '') + '</span>' +
                        '</div>' +
                        '<span class="pill uppercase tracking-wider font-bold" style="color:var(' + tColor + ');">' + esc(r.testament || '') + '</span>' +
                    '</div>' +
                    '<p class="text-sm text-slate-300 leading-relaxed mb-2">' + esc(r.definition || '') + '</p>' +
                    (r.nuance ? '<p class="text-xs text-neon-purple italic">' + esc(r.nuance) + '</p>' : '') +
                    (r.theme ? '<span class="pill mt-2">' + esc(r.theme) + '</span>' : '') +
                    (r.usageCount ? '<span class="pill mt-2 ml-1">' + esc(r.usageCount) + ' uses</span>' : '') +
                '</div>';
            });
            html += '</div>';
            el.innerHTML = html;
            _rendered.lexicon = true;
        }).catch(function () { el.innerHTML = errMsg('Lexicon'); });
    };

    function _filterLexicon(q) {
        q = (q || '').toLowerCase();
        document.querySelectorAll('.lex-card').forEach(function (c) {
            c.style.display = !q || c.dataset.search.indexOf(q) !== -1 ? '' : 'none';
        });
    }

    /* ── 4. BIBLE CHARACTERS ─────────────────────────── */
    renderers.characters = function (el) {
        Gospel.characters().then(function (rows) {
            var arr = Array.isArray(rows) ? rows : Object.values(rows);
            var html = sectionHead('Bible Characters', 'Genealogy, biographies, and lineage connections across the biblical narrative.');

            html += '<div class="mb-6"><input type="text" id="char-search" placeholder="Search by name, title, or meaning\u2026" ' +
                'class="input" oninput="Touch._filterChars(this.value)"></div>';

            html += '<div id="chars-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">';
            arr.forEach(function (r) {
                html += '<div class="glass-card p-5 char-card" data-search="' + esc(((r.name||'') + ' ' + (r.title||'') + ' ' + (r.meaning||'')).toLowerCase()) + '">' +
                    '<h3 class="font-serif text-lg font-bold text-white mb-1">' + esc(r.name || '') + '</h3>' +
                    (r.title ? '<p class="text-xs text-neon-purple font-semibold uppercase tracking-wider mb-2">' + esc(r.title) + '</p>' : '') +
                    (r.meaning ? '<p class="text-sm text-neon-gold italic mb-2">\u201c' + esc(r.meaning) + '\u201d</p>' : '') +
                    (r.lifespan ? '<p class="text-xs text-slate-500 mb-2">Lifespan: ' + esc(r.lifespan) + '</p>' : '') +
                    '<p class="text-sm text-slate-300 leading-relaxed mb-2">' + esc(trunc(r.bio || '', 200)) + '</p>' +
                    (r.reference ? '<span class="scripture-ref">' + esc(r.reference) + '</span>' : '') +
                    (r.children ? '<p class="text-xs text-slate-500 mt-2">Children: ' + esc(r.children) + '</p>' : '') +
                '</div>';
            });
            html += '</div>';
            el.innerHTML = html;
            _rendered.characters = true;
        }).catch(function () { el.innerHTML = errMsg('Characters'); });
    };

    function _filterChars(q) {
        q = (q || '').toLowerCase();
        document.querySelectorAll('.char-card').forEach(function (c) {
            c.style.display = !q || c.dataset.search.indexOf(q) !== -1 ? '' : 'none';
        });
    }

    /* ── 5. COUNSELING ───────────────────────────────── */
    renderers.counseling = function (el) {
        Gospel.counseling().then(function (rows) {
            var html = sectionHead('Biblical Counseling', 'Scriptural frameworks for navigating life\'s hardest questions.');

            html += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(340px, 1fr)); gap:1.25rem;">';
            rows.forEach(function (r) {
                var color = r.color || '#38bdf8';
                var steps = (r.steps || '').split(';').filter(Boolean);
                var scriptures = (r.scriptures || '').split(';').filter(Boolean);

                html += '<details class="glass-card-static overflow-hidden">' +
                    '<summary class="p-5 flex items-start gap-4 select-none">' +
                        '<span class="text-3xl flex-shrink-0" style="filter:drop-shadow(0 0 6px ' + color + '40);">' + (r.icon || '&#128156;') + '</span>' +
                        '<div class="flex-1">' +
                            '<h3 class="font-serif text-base font-bold text-white">' + esc(r.title || '') + '</h3>' +
                            '<p class="text-sm text-slate-400 mt-1 leading-relaxed">' + esc(trunc(r.definition || '', 120)) + '</p>' +
                        '</div>' +
                        '<span class="text-slate-500 text-xl">&#43;</span>' +
                    '</summary>' +
                    '<div class="px-5 pb-5 space-y-3">' +
                        '<p class="text-sm text-slate-300 leading-relaxed">' + esc(r.definition || '') + '</p>';
                if (steps.length) {
                    html += '<div class="space-y-2">';
                    steps.forEach(function (step, i) {
                        html += '<div class="glass-subtle p-3 flex gap-3 items-start">' +
                            '<span class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style="background:' + color + '20; color:' + color + ';">' + (i+1) + '</span>' +
                            '<p class="text-sm text-slate-300">' + esc(step.trim()) + '</p>' +
                        '</div>';
                    });
                    html += '</div>';
                }
                if (scriptures.length) {
                    html += '<div class="flex flex-wrap gap-2 mt-2">';
                    scriptures.forEach(function (s) { html += '<span class="scripture-ref">' + esc(s.trim()) + '</span>'; });
                    html += '</div>';
                }
                html += '</div></details>';
            });
            html += '</div>';
            el.innerHTML = html;
            _rendered.counseling = true;
        }).catch(function () { el.innerHTML = errMsg('Counseling'); });
    };

    /* ── 6. HEART CHECK ──────────────────────────────── */
    renderers.heart = function (el) {
        Gospel.heart().then(function (rows) {
            var html = sectionHead('Heart Check', 'Answer honestly. See where your heart aligns — and where Scripture prescribes growth.');

            var cats = {};
            rows.forEach(function (r) {
                var c = r.category || 'General';
                if (!cats[c]) cats[c] = [];
                cats[c].push(r);
            });

            html += '<div class="glass-card-static p-6 mb-8"><div class="chart-box"><canvas id="chart-heart"></canvas></div>' +
                '<p class="text-xs text-slate-500 text-center mt-4">Answer all questions below, then click \u201cSee My Heart\u201d to generate your radar chart.</p></div>';

            html += '<form id="heart-form" class="space-y-6">';
            var qIdx = 0;
            Object.keys(cats).forEach(function (catName) {
                html += '<div class="glass-card-static p-5"><h3 class="font-serif text-base font-bold text-white mb-4">' + esc(catName) + '</h3><div class="space-y-4">';
                cats[catName].forEach(function (q) {
                    html += '<div class="glass-subtle p-3">' +
                        '<label class="text-sm text-slate-300 block mb-2">' + esc(q.question || '') + '</label>' +
                        '<div class="flex gap-2">';
                    for (var v = 1; v <= 5; v++) {
                        html += '<label class="flex-1 text-center cursor-pointer">' +
                            '<input type="radio" name="hq-' + qIdx + '" value="' + v + '" data-axis="' + esc(q.chartAxis || q.category || '') + '" class="sr-only heart-radio">' +
                            '<span class="rating-opt">' + v + '</span>' +
                        '</label>';
                    }
                    html += '</div>';
                    if (q.prescription) html += '<p class="text-xs text-neon-purple mt-2 italic hidden heart-rx" data-qidx="' + qIdx + '">' + esc(q.prescription) + '</p>';
                    if (q.verseReference) html += '<span class="scripture-ref text-xs mt-1 hidden heart-rx" data-qidx="' + qIdx + '">' + esc(q.verseReference || q.verse_reference || '') + '</span>';
                    html += '</div>';
                    qIdx++;
                });
                html += '</div></div>';
            });
            html += '<div class="text-center"><button type="button" onclick="Touch._scoreHeart()" class="btn btn-primary">See My Heart</button></div>';
            html += '</form>';

            el.innerHTML = html;
            _rendered.heart = true;

            /* Style radio buttons on click */
            el.querySelectorAll('.heart-radio').forEach(function (r) {
                r.addEventListener('change', function () {
                    var parent = this.closest('.flex');
                    parent.querySelectorAll('.rating-opt').forEach(function (o) { o.classList.remove('selected'); });
                    this.nextElementSibling.classList.add('selected');
                });
            });
        }).catch(function () { el.innerHTML = errMsg('Heart Check'); });
    };

    function _scoreHeart() {
        var axes = {}, counts = {};
        document.querySelectorAll('.heart-radio:checked').forEach(function (r) {
            var a = r.dataset.axis;
            axes[a] = (axes[a] || 0) + parseInt(r.value, 10);
            counts[a] = (counts[a] || 0) + 1;
        });
        var labels = Object.keys(axes);
        var data = labels.map(function (l) { return +(axes[l] / counts[l]).toFixed(1); });
        if (!labels.length) return;

        document.querySelectorAll('.heart-rx').forEach(function (rx) { rx.classList.remove('hidden'); });

        var ctx = document.getElementById('chart-heart');
        if (!ctx) return;
        if (_charts.heart) _charts.heart.destroy();
        _charts.heart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{ label: 'Your Heart', data: data, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.12)', pointBackgroundColor: '#38bdf8', borderWidth: 2 }]
            },
            options: {
                responsive: true,
                scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, color: '#64748b', backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,0.06)' }, angleLines: { color: 'rgba(255,255,255,0.06)' }, pointLabels: { color: '#94a3b8', font: { size: 11 } } } },
                plugins: { legend: { labels: { color: '#94a3b8' } } }
            }
        });
        ctx.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ── 7. MIRROR ───────────────────────────────────── */
    renderers.mirror = function (el) {
        Gospel.mirror().then(function (rows) {
            var html = sectionHead('The Mirror', 'A reflective self-assessment — look honestly and let Scripture speak.');

            var cats = {};
            rows.forEach(function (r) {
                var cid = r.categoryId || r.category_id || 'general';
                if (!cats[cid]) cats[cid] = { title: r.categoryTitle || r.category_title || cid, color: r.color || '#c084fc', chartLabel: r.chartLabel || r.chart_label || cid, items: [] };
                cats[cid].items.push(r);
            });

            html += '<div class="glass-card-static p-6 mb-8"><div class="chart-box"><canvas id="chart-mirror"></canvas></div></div>';

            html += '<form id="mirror-form" class="space-y-5">';
            Object.keys(cats).forEach(function (cid) {
                var cat = cats[cid];
                html += '<details class="glass-card-static overflow-hidden" open>' +
                    '<summary class="p-5 flex justify-between items-center select-none">' +
                        '<h3 class="font-serif text-base font-bold" style="color:' + cat.color + ';">' + esc(cat.title) + '</h3>' +
                        '<span class="text-slate-500 text-xl">&#43;</span>' +
                    '</summary><div class="px-5 pb-5 space-y-3">';
                cat.items.forEach(function (q, qi) {
                    html += '<div class="glass-subtle p-3">' +
                        '<label class="text-sm text-slate-300 block mb-2">' + esc(q.question || q.questionId || '') + '</label>' +
                        '<div class="flex gap-2">';
                    for (var v = 1; v <= 5; v++) {
                        html += '<label class="flex-1 text-center cursor-pointer">' +
                            '<input type="radio" name="mq-' + cid + '-' + qi + '" value="' + v + '" data-cat="' + esc(cid) + '" class="sr-only mirror-radio">' +
                            '<span class="rating-opt">' + v + '</span>' +
                        '</label>';
                    }
                    html += '</div>';
                    if (q.prescription) html += '<p class="text-xs italic mt-2 hidden mirror-rx" style="color:' + cat.color + ';">' + esc(q.prescription) + '</p>';
                    if (q.scripture) html += '<span class="scripture-ref text-xs mt-1 hidden mirror-rx">' + esc(q.scripture) + '</span>';
                    html += '</div>';
                });
                html += '</div></details>';
            });
            html += '<div class="text-center"><button type="button" onclick="Touch._scoreMirror()" class="btn" style="background:linear-gradient(135deg,#c084fc,#38bdf8);">Reflect</button></div>';
            html += '</form>';

            el.innerHTML = html;
            _rendered.mirror = true;

            el.querySelectorAll('.mirror-radio').forEach(function (r) {
                r.addEventListener('change', function () {
                    var parent = this.closest('.flex');
                    parent.querySelectorAll('.rating-opt').forEach(function (o) { o.classList.remove('selected'); });
                    this.nextElementSibling.classList.add('selected');
                });
            });
        }).catch(function () { el.innerHTML = errMsg('Mirror'); });
    };

    function _scoreMirror() {
        var axes = {}, counts = {};
        document.querySelectorAll('.mirror-radio:checked').forEach(function (r) {
            var a = r.dataset.cat;
            axes[a] = (axes[a] || 0) + parseInt(r.value, 10);
            counts[a] = (counts[a] || 0) + 1;
        });
        var labels = Object.keys(axes);
        var data = labels.map(function (l) { return +(axes[l] / counts[l]).toFixed(1); });
        if (!labels.length) return;

        document.querySelectorAll('.mirror-rx').forEach(function (rx) { rx.classList.remove('hidden'); });

        var ctx = document.getElementById('chart-mirror');
        if (!ctx) return;
        if (_charts.mirror) _charts.mirror.destroy();
        _charts.mirror = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{ label: 'Your Reflection', data: data, borderColor: '#c084fc', backgroundColor: 'rgba(192,132,252,0.12)', pointBackgroundColor: '#c084fc', borderWidth: 2 }]
            },
            options: {
                responsive: true,
                scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, color: '#64748b', backdropColor: 'transparent' }, grid: { color: 'rgba(255,255,255,0.06)' }, angleLines: { color: 'rgba(255,255,255,0.06)' }, pointLabels: { color: '#94a3b8', font: { size: 11 } } } },
                plugins: { legend: { labels: { color: '#94a3b8' } } }
            }
        });
        ctx.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /* ── 8. BIBLE QUIZ ───────────────────────────────── */
    renderers.quiz = function (el) {
        Gospel.quiz().then(function (rows) {
            var html = sectionHead('Bible Quiz', 'Test your knowledge of Scripture across categories and difficulty levels.');

            el._quizRows = rows;
            el._quizIdx = 0;
            el._quizScore = 0;
            el._quizTotal = 0;
            el._quizPool = [];

            html += '<div class="text-center mb-6"><div class="flex flex-wrap justify-center gap-2">' +
                '<button class="lang-btn active" onclick="Touch._startQuiz(\'all\')">All</button>' +
                '<button class="lang-btn" onclick="Touch._startQuiz(\'Easy\')">Easy</button>' +
                '<button class="lang-btn" onclick="Touch._startQuiz(\'Medium\')">Medium</button>' +
                '<button class="lang-btn" onclick="Touch._startQuiz(\'Hard\')">Hard</button>' +
            '</div></div>';

            html += '<div id="quiz-arena" class="glass-card-static p-8 text-center"><p class="text-slate-400">Select a difficulty to begin.</p></div>';
            html += '<div id="quiz-score" class="text-center mt-4 text-sm text-slate-500"></div>';

            el.innerHTML = html;
            _rendered.quiz = true;
        }).catch(function () { el.innerHTML = errMsg('Quiz'); });
    };

    function _startQuiz(diff) {
        var el = document.getElementById('view-quiz');
        var rows = el._quizRows;
        var pool = diff === 'all' ? rows.slice() : rows.filter(function (r) { return (r.difficulty||'').toLowerCase() === diff.toLowerCase(); });
        for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
        pool = pool.slice(0, 20);
        el._quizPool = pool;
        el._quizIdx = 0;
        el._quizScore = 0;
        el._quizTotal = pool.length;
        _showQuizQ();
    }

    function _showQuizQ() {
        var el = document.getElementById('view-quiz');
        var arena = document.getElementById('quiz-arena');
        var scoreEl = document.getElementById('quiz-score');
        var pool = el._quizPool, idx = el._quizIdx;

        if (idx >= pool.length) {
            var pct = el._quizScore / el._quizTotal;
            arena.innerHTML = '<div class="py-10"><h3 class="font-serif text-2xl font-bold text-white mb-3">Quiz Complete!</h3>' +
                '<p class="text-4xl font-bold text-neon-teal">' + el._quizScore + ' / ' + el._quizTotal + '</p>' +
                '<p class="text-slate-400 mt-2">' + (pct >= 0.8 ? 'Excellent work!' : pct >= 0.5 ? 'Good effort — keep studying!' : 'Keep digging into the Word!') + '</p>' +
                '<button class="btn btn-ghost mt-6" style="font-size:0.85rem; padding:0.5rem 1.5rem;" onclick="Touch._startQuiz(\'all\')">Play Again</button></div>';
            return;
        }

        var q = pool[idx];
        var opts = [
            { key:'A', text: q.optionA || q.a || '' },
            { key:'B', text: q.optionB || q.b || '' },
            { key:'C', text: q.optionC || q.c || '' },
            { key:'D', text: q.optionD || q.d || '' }
        ].filter(function (o) { return o.text; });
        var correct = (q.correctAnswer || q.ans || '').toUpperCase();

        arena.innerHTML = '<div>' +
            '<div class="flex justify-between text-xs text-slate-500 mb-4"><span>Question ' + (idx+1) + ' of ' + pool.length + '</span>' +
            '<span class="pill">' + esc(q.category || q.cat || '') + '</span></div>' +
            '<h3 class="font-serif text-lg font-bold text-white mb-6 leading-relaxed">' + esc(q.question || q.q || '') + '</h3>' +
            '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:0.75rem;" id="quiz-opts">' +
            opts.map(function (o) {
                return '<button class="quiz-opt" data-key="' + o.key + '" data-correct="' + correct + '" onclick="Touch._answerQuiz(this)">' +
                    '<span class="font-bold text-neon-blue mr-2">' + o.key + '.</span>' + esc(o.text) + '</button>';
            }).join('') +
            '</div>' +
            (q.reference || q.ref ? '<p class="text-xs text-slate-600 mt-4">' + esc(q.reference || q.ref || '') + '</p>' : '') +
        '</div>';

        scoreEl.textContent = 'Score: ' + el._quizScore + ' / ' + idx + ' (' + pool.length + ' total)';
    }

    function _answerQuiz(btn) {
        var el = document.getElementById('view-quiz');
        var correct = btn.dataset.correct, chosen = btn.dataset.key;
        document.querySelectorAll('.quiz-opt').forEach(function (b) {
            b.disabled = true; b.style.pointerEvents = 'none';
            if (b.dataset.key === correct) { b.style.borderColor = '#2dd4bf'; b.style.background = 'rgba(45,212,191,0.12)'; b.style.color = '#fff'; }
            if (b.dataset.key === chosen && chosen !== correct) { b.style.borderColor = '#ff4040'; b.style.background = 'rgba(255,64,64,0.12)'; b.style.color = '#ff4040'; }
        });
        if (chosen === correct) el._quizScore++;
        el._quizIdx++;
        setTimeout(_showQuizQ, 1200);
    }

    /* ── 9. APOLOGETICS / FAQs ───────────────────────── */
    renderers.apologetics = function (el) {
        Gospel.apologetics().then(function (rows) {
            var html = sectionHead('Apologetics & FAQs', 'Answers to the toughest questions about the Christian faith.');

            var cats = {};
            rows.forEach(function (r) {
                var c = r.categoryTitle || r.category_title || 'General';
                if (!cats[c]) cats[c] = { intro: r.categoryIntro || r.category_intro || '', items: [] };
                cats[c].items.push(r);
            });

            html += '<div class="space-y-6">';
            Object.keys(cats).forEach(function (catName, i) {
                var cat = cats[catName];
                html += '<details class="glass-card-static overflow-hidden" ' + (i === 0 ? 'open' : '') + '>' +
                    '<summary class="p-5 flex justify-between items-center select-none">' +
                        '<div><h3 class="font-serif text-lg font-bold text-white">' + esc(catName) + '</h3>' +
                        (cat.intro ? '<p class="text-sm text-slate-400 mt-1">' + esc(trunc(cat.intro, 150)) + '</p>' : '') +
                    '</div><span class="text-slate-500 text-xl">&#43;</span>' +
                    '</summary><div class="px-5 pb-5 space-y-4">';
                cat.items.forEach(function (q) {
                    html += '<details class="glass-subtle overflow-hidden">' +
                        '<summary class="p-4 text-sm font-semibold text-neon-blue select-none">' + esc(q.shortTitle || q.short_title || q.questionTitle || q.question_title || '') + '</summary>' +
                        '<div class="px-4 pb-4 space-y-3">' +
                            (q.quoteText || q.quote_text ? '<blockquote class="scripture-quote">\u201c' + esc(q.quoteText || q.quote_text) + '\u201d</blockquote>' : '') +
                            '<p class="text-sm text-slate-300 leading-relaxed">' + esc(q.answerContent || q.answer_content || '') + '</p>' +
                            (q.referenceText || q.reference_text ? '<span class="scripture-ref">' + esc(q.referenceText || q.reference_text) + '</span>' : '') +
                        '</div>' +
                    '</details>';
                });
                html += '</div></details>';
            });
            html += '</div>';
            el.innerHTML = html;
            _rendered.apologetics = true;
        }).catch(function () { el.innerHTML = errMsg('Apologetics'); });
    };

    /* ── 10. PRAYER REQUEST ──────────────────────────── */
    renderers.prayer = function (el) {
        var html = sectionHead('Prayer Request', 'Submit a prayer and our intercessory team will lift you up before the throne of grace.');

        html += '<div class="max-w-2xl mx-auto glass-card-static p-8">' +
            '<form id="prayer-form" onsubmit="Touch._submitPrayer(event)" class="space-y-5">' +
                '<div>' +
                    '<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Your Name</label>' +
                    '<input name="submitterName" required class="input" placeholder="Your name">' +
                '</div>' +
                '<div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">' +
                    '<div>' +
                        '<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Email</label>' +
                        '<input name="submitterEmail" type="email" class="input" placeholder="you@email.com">' +
                    '</div>' +
                    '<div>' +
                        '<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Phone</label>' +
                        '<input name="submitterPhone" type="tel" class="input" placeholder="(555) 123-4567">' +
                    '</div>' +
                '</div>' +
                '<div>' +
                    '<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Category</label>' +
                    '<select name="category" class="input">' +
                        '<option value="General">General</option>' +
                        '<option value="Health">Health</option>' +
                        '<option value="Family">Family</option>' +
                        '<option value="Financial">Financial</option>' +
                        '<option value="Spiritual Growth">Spiritual Growth</option>' +
                        '<option value="Grief">Grief & Loss</option>' +
                        '<option value="Praise Report">Praise Report</option>' +
                    '</select>' +
                '</div>' +
                '<div>' +
                    '<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Your Prayer</label>' +
                    '<textarea name="prayerText" required rows="5" class="input" style="resize:vertical;" placeholder="Share your prayer request\u2026"></textarea>' +
                '</div>' +
                '<button type="submit" id="prayer-submit" class="btn btn-primary w-full">&#128591; Submit Prayer Request</button>' +
                '<div id="prayer-msg" class="text-center text-sm hidden"></div>' +
            '</form>' +
        '</div>';

        el.innerHTML = html;
        _rendered.prayer = true;
    };

    function _submitPrayer(e) {
        e.preventDefault();
        var form = document.getElementById('prayer-form');
        var btn = document.getElementById('prayer-submit');
        var msg = document.getElementById('prayer-msg');
        var fd = new FormData(form);

        btn.disabled = true; btn.textContent = 'Submitting\u2026';

        Gospel.submitPrayer({
            submitterName:  fd.get('submitterName'),
            submitterEmail: fd.get('submitterEmail'),
            submitterPhone: fd.get('submitterPhone'),
            prayerText:     fd.get('prayerText'),
            category:       fd.get('category')
        }).then(function () {
            msg.className = 'text-center text-sm text-neon-teal';
            msg.textContent = 'Your prayer has been received. Our team will be interceding for you.';
            msg.style.display = 'block';
            form.reset();
        }).catch(function () {
            msg.className = 'text-center text-sm text-neon-crimson';
            msg.textContent = 'Something went wrong. Please try again.';
            msg.style.display = 'block';
        }).finally(function () {
            btn.disabled = false; btn.innerHTML = '&#128591; Submit Prayer Request';
        });
    }

    /* ══════════════════════════════════════════════════════
     *  BOOT
     * ══════════════════════════════════════════════════════ */
    window.addEventListener('DOMContentLoaded', function () {
        renderHomeCards();
        if (window.Gospel) Gospel.prefetch();
    });

    /* ── Public API ──────────────────────────────────── */
    window.Touch = {
        render:          render,
        onLangChange:    onLangChange,
        _filterBooks:    _filterBooks,
        _filterLexicon:  _filterLexicon,
        _filterChars:    _filterChars,
        _scoreHeart:     _scoreHeart,
        _scoreMirror:    _scoreMirror,
        _startQuiz:      _startQuiz,
        _answerQuiz:     _answerQuiz,
        _submitPrayer:   _submitPrayer
    };

})();
