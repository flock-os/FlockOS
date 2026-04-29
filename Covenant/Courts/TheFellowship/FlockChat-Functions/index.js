/**
 * FlockChat — FCM Push Notification Cloud Functions
 *
 * Triggers on new messages in channels and DMs, then sends
 * FCM push notifications to all members (except the sender).
 *
 * Deploy:
 *   firebase deploy --only functions --project flockos-comms
 */

const { onDocumentCreated } = require('firebase-functions/firestore');
const { initializeApp }     = require('firebase-admin/app');
const { getFirestore }      = require('firebase-admin/firestore');
const { getMessaging }      = require('firebase-admin/messaging');

initializeApp();
const db  = getFirestore();
const fcm = getMessaging();

// ── Helper: send FCM to a list of tokens ──────────────────────────────
async function _sendPush(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) return;

  // Filter out blank/null tokens
  const clean = tokens.filter(t => typeof t === 'string' && t.length > 10);
  if (clean.length === 0) return;

  const message = {
    notification: { title, body },
    data:         { ...data },
    tokens:       clean,
  };

  try {
    const response = await fcm.sendEachForMulticast(message);
    // Remove stale tokens that returned 'registration-token-not-registered'
    const stale = [];
    response.responses.forEach((r, i) => {
      if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
        stale.push(clean[i]);
      }
    });
    if (stale.length > 0) await _removeStaleTokens(stale);
  } catch (err) {
    console.error('FCM sendEachForMulticast error:', err);
  }
}

// ── Helper: remove expired FCM tokens from user docs ──────────────────
async function _removeStaleTokens(staleTokens) {
  const usersSnap = await db.collection('users')
    .where('fcmToken', 'in', staleTokens)
    .get();
  const batch = db.batch();
  usersSnap.forEach(doc => batch.update(doc.ref, { fcmToken: null }));
  await batch.commit().catch(() => {});
}

// ── Helper: remove stale tokens scoped to a church tenant ─────────────
async function _removeStaleTokensScoped(staleTokens, usersCol) {
  const usersSnap = await usersCol
    .where('fcmToken', 'in', staleTokens)
    .get();
  const batch = db.batch();
  usersSnap.forEach(doc => batch.update(doc.ref, { fcmToken: null }));
  await batch.commit().catch(() => {});
}

// ── Helper: get FCM tokens for a list of uids (excluding sender) ──────
async function _getTokens(uids, excludeUid, usersCol) {
  const targets = uids.filter(uid => uid !== excludeUid);
  if (targets.length === 0) return [];

  const col = usersCol || db.collection('users');
  // Firestore 'in' supports up to 30 items; batch if needed
  const tokens = [];
  for (let i = 0; i < targets.length; i += 30) {
    const chunk = targets.slice(i, i + 30);
    const snap  = await col
      .where('__name__', 'in', chunk)
      .get();
    snap.forEach(doc => {
      const token = doc.data()?.fcmToken;
      if (token) tokens.push(token);
    });
  }
  return tokens;
}

// ── Trigger 1a: new message in a channel (default / legacy) ──────────
exports.notifyChannelMessage = onDocumentCreated(
  'channels/{chId}/messages/{msgId}',
  async (event) => {
    const msg  = event.data?.data();
    if (!msg) return;
    const chId       = event.params.chId;
    const senderUid  = msg.senderUid || msg.uid || '';
    const senderName = msg.senderName || msg.displayName || 'Someone';
    const text       = msg.text || (msg.imageUrl ? '📎 attachment' : '…');
    const chDoc = await db.collection('channels').doc(chId).get();
    if (!chDoc.exists) return;
    const ch      = chDoc.data();
    const members = ch.members || [];
    const chName  = ch.name || 'channel';
    const tokens = await _getTokens(members, senderUid, db.collection('users'));
    await _sendPush(tokens, `#${chName}`, `${senderName}: ${text.substring(0, 120)}`, { channelId: chId, type: 'channel' });
  }
);

// ── Trigger 1b: new message in a channel (multi-tenant) ───────────────
exports.notifyChannelMessageTenant = onDocumentCreated(
  'churches/{churchId}/channels/{chId}/messages/{msgId}',
  async (event) => {
    const msg  = event.data?.data();
    if (!msg) return;
    const { churchId, chId } = event.params;
    const senderUid  = msg.senderUid || msg.uid || '';
    const senderName = msg.senderName || msg.displayName || 'Someone';
    const text       = msg.text || (msg.imageUrl ? '📎 attachment' : '…');
    const base   = db.collection('churches').doc(churchId);
    const chDoc  = await base.collection('channels').doc(chId).get();
    if (!chDoc.exists) return;
    const ch      = chDoc.data();
    const members = ch.members || [];
    const chName  = ch.name || 'channel';
    const tokens = await _getTokens(members, senderUid, base.collection('users'));
    await _sendPush(tokens, `#${chName}`, `${senderName}: ${text.substring(0, 120)}`, { channelId: chId, churchId, type: 'channel' });
  }
);

// ── Trigger 2a: new message in a DM (default / legacy) ────────────────
exports.notifyDMMessage = onDocumentCreated(
  'dms/{dmId}/messages/{msgId}',
  async (event) => {
    const msg  = event.data?.data();
    if (!msg) return;
    const dmId       = event.params.dmId;
    const senderUid  = msg.senderUid || msg.uid || '';
    const senderName = msg.senderName || msg.displayName || 'Someone';
    const text       = msg.text || (msg.imageUrl ? '📎 attachment' : '…');
    const dmDoc = await db.collection('dms').doc(dmId).get();
    if (!dmDoc.exists) return;
    const members = dmDoc.data()?.members || [];
    const tokens = await _getTokens(members, senderUid, db.collection('users'));
    await _sendPush(tokens, senderName, text.substring(0, 120), { channelId: dmId, type: 'dm' });
  }
);

// ── Trigger 2b: new message in a DM (multi-tenant) ────────────────────
exports.notifyDMMessageTenant = onDocumentCreated(
  'churches/{churchId}/dms/{dmId}/messages/{msgId}',
  async (event) => {
    const msg  = event.data?.data();
    if (!msg) return;
    const { churchId, dmId } = event.params;
    const senderUid  = msg.senderUid || msg.uid || '';
    const senderName = msg.senderName || msg.displayName || 'Someone';
    const text       = msg.text || (msg.imageUrl ? '📎 attachment' : '…');
    const base  = db.collection('churches').doc(churchId);
    const dmDoc = await base.collection('dms').doc(dmId).get();
    if (!dmDoc.exists) return;
    const members = dmDoc.data()?.members || [];
    const tokens = await _getTokens(members, senderUid, base.collection('users'));
    await _sendPush(tokens, senderName, text.substring(0, 120), { channelId: dmId, churchId, type: 'dm' });
  }
);
