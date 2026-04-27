/* ══════════════════════════════════════════════════════════════════════════════
   THE ATTACHMENTS — Image / file uploads to Storage
   "Bring an offering, and come into his courts." — Psalm 96:8

   Uploads land at: churches/{cid}/uploads/{channelId}/{ts}_{name}
   Returns a stable URL the message body can reference.
   ══════════════════════════════════════════════════════════════════════════════ */

import { callWhen, when } from '../the_legacy_bridge.js';

const NAME = 'TheUpperRoom';

export const ready = () => when(NAME);

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

/** Upload a File / Blob and return { url, name, size, contentType }. */
export async function upload(file, { channelId } = {}) {
  if (!file) throw new Error('No file');
  if (file.size > MAX_BYTES) throw new Error('File is too large (25 MB max).');
  return callWhen(NAME, 'uploadAttachment', file, { channelId });
}

/** Validate before bothering the network. */
export function validate(file) {
  if (!file) return { ok: false, message: 'Choose a file first.' };
  if (file.size > MAX_BYTES) return { ok: false, message: 'That file is too large (25 MB max).' };
  return { ok: true };
}
