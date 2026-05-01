/* ══════════════════════════════════════════════════════════════════════════════
   THE IDENTITY — Single sign-on bridge: Nehemiah session → Firebase auth
   "Hereby know we that we dwell in him, and he in us." — 1 John 4:13

   Mints a Firebase custom token via a Cloud Function (mintFlockchatToken)
   in the church's own Firebase project, using the Nehemiah session token
   as proof of identity. Caches the token in the_cistern until expiry.

   Public API:
     mint()              — Promise<{ token, expires }>  (cached if fresh)
     signInToFirebase(firebaseAuth)  — calls signInWithCustomToken(...)
     forget()            — clears the cache (sign-out)

   The actual signInWithCustomToken happens in the_messages/the_channels when
   they bootstrap their Firebase clients — this file owns only the token.
   ══════════════════════════════════════════════════════════════════════════════ */

import { read as cisternRead, write as cisternWrite, remove as cisternRemove } from '../the_cistern.js';
import { readToken } from '../the_priesthood/the_anointing.js';
import { churchId } from './the_tenant.js';
import { getProjectId } from './the_firebase_config.js';

const CACHE_KEY = () => `upper:firebase_token:${churchId()}`;
const SAFETY_MS = 60_000; // refresh 60s before stated expiry

export async function mint() {
  const cached = await cisternRead(CACHE_KEY());
  if (cached && cached.token && cached.expires - SAFETY_MS > Date.now()) {
    return cached;
  }
  const sessionToken = readToken();
  if (!sessionToken) throw new Error('No FlockOS session — sign in first.');

  const url = `https://us-central1-${getProjectId()}.cloudfunctions.net/mintFlockchatToken`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, churchId: churchId() }),
  });
  if (!res.ok) throw new Error(`mintFlockchatToken failed (${res.status})`);
  const body = await res.json();
  if (!body || !body.token) throw new Error('mint returned no token');

  const ttl  = Number(body.expiresInSec || 3500) * 1000;
  const rec  = { token: body.token, expires: Date.now() + ttl };
  await cisternWrite(CACHE_KEY(), rec);
  return rec;
}

export async function signInToFirebase(firebaseAuth, signInWithCustomToken) {
  const { token } = await mint();
  return signInWithCustomToken(firebaseAuth, token);
}

export async function forget() {
  await cisternRemove(CACHE_KEY());
}
