/* ══════════════════════════════════════════════════════════════════════════════
   THE BIBLE LINK — Auto-linkify scripture references → bible.com (ESV)
   "Search the scriptures." — John 5:39

   Walks the live DOM and converts any text matching a scripture pattern
   ("John 3:16", "1 Cor 13:4-7", "Psalm 23", "Song of Solomon 2:1") into a
   real <a> that opens YouVersion's bible.com in the ESV translation
   (translation id 59).

   • Safe — skips text inside <a>, <script>, <style>, <textarea>, <input>,
     <code>, <pre>, or any [contenteditable].
   • Self-installing — boot calls installScriptureLinks(document.body) once
     and a MutationObserver linkifies anything added later.
   • Idempotent — already-linked refs (data-bible attribute) are skipped.
   ══════════════════════════════════════════════════════════════════════════════ */

const ESV = 59; // YouVersion translation id for ESV

// Canonical book codes (YouVersion / USFM 3-letter codes).
const BOOKS = {
  // OT
  'genesis': 'GEN', 'gen': 'GEN',
  'exodus': 'EXO', 'exo': 'EXO', 'exod': 'EXO',
  'leviticus': 'LEV', 'lev': 'LEV',
  'numbers': 'NUM', 'num': 'NUM',
  'deuteronomy': 'DEU', 'deut': 'DEU', 'deu': 'DEU',
  'joshua': 'JOS', 'josh': 'JOS', 'jos': 'JOS',
  'judges': 'JDG', 'judg': 'JDG', 'jdg': 'JDG',
  'ruth': 'RUT', 'rut': 'RUT',
  '1 samuel': '1SA', '1samuel': '1SA', '1 sam': '1SA', '1sam': '1SA', 'i samuel': '1SA',
  '2 samuel': '2SA', '2samuel': '2SA', '2 sam': '2SA', '2sam': '2SA', 'ii samuel': '2SA',
  '1 kings': '1KI', '1kings': '1KI', '1 kgs': '1KI', '1kgs': '1KI', 'i kings': '1KI',
  '2 kings': '2KI', '2kings': '2KI', '2 kgs': '2KI', '2kgs': '2KI', 'ii kings': '2KI',
  '1 chronicles': '1CH', '1chronicles': '1CH', '1 chron': '1CH', '1 chr': '1CH', 'i chronicles': '1CH',
  '2 chronicles': '2CH', '2chronicles': '2CH', '2 chron': '2CH', '2 chr': '2CH', 'ii chronicles': '2CH',
  'ezra': 'EZR', 'ezr': 'EZR',
  'nehemiah': 'NEH', 'neh': 'NEH',
  'esther': 'EST', 'est': 'EST',
  'job': 'JOB',
  'psalm': 'PSA', 'psalms': 'PSA', 'ps': 'PSA', 'psa': 'PSA',
  'proverbs': 'PRO', 'prov': 'PRO', 'pro': 'PRO',
  'ecclesiastes': 'ECC', 'eccl': 'ECC', 'ecc': 'ECC',
  'song of solomon': 'SNG', 'song of songs': 'SNG', 'song': 'SNG', 'sng': 'SNG', 'sos': 'SNG', 'canticles': 'SNG',
  'isaiah': 'ISA', 'isa': 'ISA',
  'jeremiah': 'JER', 'jer': 'JER',
  'lamentations': 'LAM', 'lam': 'LAM',
  'ezekiel': 'EZK', 'ezek': 'EZK', 'ezk': 'EZK',
  'daniel': 'DAN', 'dan': 'DAN',
  'hosea': 'HOS', 'hos': 'HOS',
  'joel': 'JOL', 'jol': 'JOL',
  'amos': 'AMO', 'amo': 'AMO',
  'obadiah': 'OBA', 'oba': 'OBA',
  'jonah': 'JON', 'jon': 'JON',
  'micah': 'MIC', 'mic': 'MIC',
  'nahum': 'NAM', 'nah': 'NAM', 'nam': 'NAM',
  'habakkuk': 'HAB', 'hab': 'HAB',
  'zephaniah': 'ZEP', 'zeph': 'ZEP', 'zep': 'ZEP',
  'haggai': 'HAG', 'hag': 'HAG',
  'zechariah': 'ZEC', 'zech': 'ZEC', 'zec': 'ZEC',
  'malachi': 'MAL', 'mal': 'MAL',
  // NT
  'matthew': 'MAT', 'matt': 'MAT', 'mat': 'MAT',
  'mark': 'MRK', 'mrk': 'MRK', 'mk': 'MRK',
  'luke': 'LUK', 'luk': 'LUK', 'lk': 'LUK',
  'john': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
  'acts': 'ACT', 'act': 'ACT',
  'romans': 'ROM', 'rom': 'ROM',
  '1 corinthians': '1CO', '1corinthians': '1CO', '1 cor': '1CO', '1cor': '1CO', 'i corinthians': '1CO',
  '2 corinthians': '2CO', '2corinthians': '2CO', '2 cor': '2CO', '2cor': '2CO', 'ii corinthians': '2CO',
  'galatians': 'GAL', 'gal': 'GAL',
  'ephesians': 'EPH', 'eph': 'EPH',
  'philippians': 'PHP', 'phil': 'PHP', 'php': 'PHP',
  'colossians': 'COL', 'col': 'COL',
  '1 thessalonians': '1TH', '1thessalonians': '1TH', '1 thess': '1TH', '1 thes': '1TH', 'i thessalonians': '1TH',
  '2 thessalonians': '2TH', '2thessalonians': '2TH', '2 thess': '2TH', '2 thes': '2TH', 'ii thessalonians': '2TH',
  '1 timothy': '1TI', '1timothy': '1TI', '1 tim': '1TI', '1tim': '1TI', 'i timothy': '1TI',
  '2 timothy': '2TI', '2timothy': '2TI', '2 tim': '2TI', '2tim': '2TI', 'ii timothy': '2TI',
  'titus': 'TIT', 'tit': 'TIT',
  'philemon': 'PHM', 'philem': 'PHM', 'phm': 'PHM',
  'hebrews': 'HEB', 'heb': 'HEB',
  'james': 'JAS', 'jas': 'JAS',
  '1 peter': '1PE', '1peter': '1PE', '1 pet': '1PE', '1pet': '1PE', 'i peter': '1PE',
  '2 peter': '2PE', '2peter': '2PE', '2 pet': '2PE', '2pet': '2PE', 'ii peter': '2PE',
  '1 john': '1JN', '1john': '1JN', '1 jn': '1JN', '1jn': '1JN', 'i john': '1JN',
  '2 john': '2JN', '2john': '2JN', '2 jn': '2JN', '2jn': '2JN', 'ii john': '2JN',
  '3 john': '3JN', '3john': '3JN', '3 jn': '3JN', '3jn': '3JN', 'iii john': '3JN',
  'jude': 'JUD',
  'revelation': 'REV', 'rev': 'REV', 'revelations': 'REV',
};

// Build a single regex matching: optional "1/2/3/I/II/III ", book name, ws, ch:vs(-vs)?
// Sort keys longest-first so "1 corinthians" matches before "1" anything.
const _names = Object.keys(BOOKS).sort((a, b) => b.length - a.length).map(n =>
  n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
);
const _BOOK_RE = '(?:' + _names.join('|') + ')';
// Boundary uses lookbehind/ahead so "Hebrews" doesn't match inside other words.
// Allow "Psalm 23" (chapter only) as well as "John 3:16" or "1 Cor 13:4-7".
const SCRIPTURE_RE = new RegExp(
  '(?<![A-Za-z0-9])(' + _BOOK_RE + ')\\.?\\s+(\\d+)(?::(\\d+)(?:[-\u2013](\\d+))?)?(?![A-Za-z0-9])',
  'gi'
);

/** Build a bible.com URL in ESV for a parsed reference. */
export function bibleUrl(bookKey, chapter, verse, verseEnd) {
  const code = BOOKS[String(bookKey || '').toLowerCase().replace(/\s+/g, ' ').trim()];
  if (!code) return null;
  let path = `${code}.${chapter}`;
  if (verse) path += `.${verse}`;
  if (verseEnd) path += `-${verseEnd}`;
  return `https://www.bible.com/bible/${ESV}/${path}.ESV`;
}

const SKIP_TAGS = new Set(['A', 'SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'OPTION', 'NOSCRIPT']);

function _shouldSkip(node) {
  for (let p = node.parentNode; p && p.nodeType === 1; p = p.parentNode) {
    if (SKIP_TAGS.has(p.tagName)) return true;
    if (p.isContentEditable) return true;
    if (p.dataset && p.dataset.noScripture === '') return true;
  }
  return false;
}

function _linkifyTextNode(node) {
  const text = node.nodeValue;
  if (!text || text.length < 5) return;
  if (!/\d/.test(text)) return; // refs always contain a digit
  SCRIPTURE_RE.lastIndex = 0;
  let m, last = 0, frag = null;
  while ((m = SCRIPTURE_RE.exec(text)) !== null) {
    const [match, book, ch, vs, vsEnd] = m;
    const url = bibleUrl(book, ch, vs, vsEnd);
    if (!url) continue;
    if (!frag) frag = document.createDocumentFragment();
    if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.dataset.bible = '';
    a.className = 'scripture-link';
    a.textContent = match;
    frag.appendChild(a);
    last = m.index + match.length;
  }
  if (frag) {
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
}

function _scan(root) {
  if (!root || root.nodeType !== 1) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || !/\d/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
      if (_shouldSkip(n)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  let n; while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(_linkifyTextNode);
}

let _installed = false;
export function installScriptureLinks(root = document.body) {
  if (_installed) return;
  _installed = true;
  // Initial sweep.
  _scan(root);
  // Inject minimal style for the link affordance.
  if (!document.getElementById('scripture-link-style')) {
    const s = document.createElement('style');
    s.id = 'scripture-link-style';
    s.textContent = `.scripture-link{color:inherit;border-bottom:1px dotted currentColor;text-decoration:none;}
.scripture-link:hover{color:var(--gold,#e8a838);border-bottom-color:var(--gold,#e8a838);}`;
    document.head.appendChild(s);
  }
  // Watch for any added subtrees and linkify them.
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((nd) => {
        if (nd.nodeType === 1) _scan(nd);
        else if (nd.nodeType === 3 && !_shouldSkip(nd)) _linkifyTextNode(nd);
      });
    }
  });
  obs.observe(root, { childList: true, subtree: true });
}
