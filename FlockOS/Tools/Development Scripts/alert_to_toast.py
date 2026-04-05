#!/usr/bin/env python3
"""
Convert alert() calls to _toast() calls in the_tabernacle.js
Rules:
  - Error/failure messages → _toast(msg, 'danger')
  - Success/confirmation messages → _toast(msg) [default 'success']
  - Validation/info messages → _toast(msg, 'warn')
"""
import re, sys

TARGET = 'FlockOS/Scripts/the_tabernacle.js'

DANGER_KEYWORDS = [
    'error', 'Error', 'failed', 'Failed', 'fail', 'Fail',
    'Could not', 'could not', 'Cannot', 'cannot',
    'denied', 'blocked', 'Blocked',
]
SUCCESS_KEYWORDS = [
    'Copied', 'copied', 'saved', 'Saved', 'sent', 'Sent',
    'created', 'Created', 'submitted', 'Submitted',
    'answered', 'Answered', 'lifted', 'Lifted',
    'Checked in', 'restored', 'Restored', 'cleared', 'Cleared',
    'submitted', 'praying', 'God bless', 'activated', 'Activated',
    'lifted', 'live again', 'imported', 'Imported',
]

def classify(msg_str):
    """Return 'danger', 'success', or 'warn' based on message content."""
    for k in DANGER_KEYWORDS:
        if k in msg_str:
            return 'danger'
    for k in SUCCESS_KEYWORDS:
        if k in msg_str:
            return 'success'
    return 'warn'

def replace_alert(m):
    inner = m.group(1)  # everything inside alert(...)
    toast_type = classify(inner)
    if toast_type == 'success':
        return '_toast(' + inner + ')'
    else:
        return '_toast(' + inner + ", '" + toast_type + "')"

with open(TARGET, 'r', encoding='utf-8') as f:
    src = f.read()

# Match alert(...) — single-line only (all instances in this file are single-line)
# Greedy is wrong; use a simple balanced-paren approach for single-line
pattern = re.compile(r'\balert\((.+?)\)(?=\s*[;,\)])', re.DOTALL)

# Only replace within single lines (safety: don't replace across newlines)
lines_in = src.split('\n')
lines_out = []
count = 0
for line in lines_in:
    new_line, n = pattern.subn(replace_alert, line)
    count += n
    lines_out.append(new_line)

result = '\n'.join(lines_out)

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(result)

print(f'Replaced {count} alert() calls.')
