#!/usr/bin/env python3
"""Debug the rename regex."""
import re

test_lines = [
    '<script defer src="../Acts/fine_linen.min.js"></script>',
    "'./FlockOS/Revelation/the_good_shepherd.min.html',",
    "'./FlockOS/Acts/the_true_vine.min.js',",
    "const LOGIN_PAGE  = _base + 'Revelation/the_wall.min.html';",
    '<script defer src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>',
    "href=\"the_good_shepherd.min.html?view=learning\"",
    "window.location.href = 'the_wall.min.html';",
    '"start_url": "FlockOS/Revelation/the_good_shepherd.min.html",',
]

CDN_SKIP = {'xlsx.full.min.js', 'jspdf.umd.min.js'}

def convert_line(line):
    def replacer(m):
        full = m.group(0)
        fname_part = m.group(2) + '.min.' + m.group(3)
        if fname_part in CDN_SKIP:
            return full
        prefix = m.group(1)
        name   = m.group(2)
        ext    = m.group(3)
        return prefix + 'm.' + name + '.' + ext
    return re.sub(r'((?:[\w./@-]*/)?)(\w[\w_.-]*?)\.min\.(js|html)\b', replacer, line)

for line in test_lines:
    result = convert_line(line)
    if result != line:
        print("OK   ", line[:60])
        print("  => ", result[:60])
    else:
        print("SKIP ", line[:60])
