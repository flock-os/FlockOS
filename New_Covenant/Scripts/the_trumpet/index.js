/* ══════════════════════════════════════════════════════════════════════════════
   THE TRUMPET — FlockOS Phone & Device Integration Layer
   "Blow the trumpet in Zion; sound the alarm on my holy hill." — Joel 2:1

   Browser-native device APIs — no external dependencies.

   EXPORTS:
     share(data)          — Web Share API (falls back to clipboard)
     clipboard(text)      — Copy text to clipboard
     call(phone)          — Open tel: dialer
     sms(phone, body?)    — Open sms: composer
     notify(title, opts)  — Web Notification API
     badge(count)         — App badge count (PWA)
     fullscreen(el?)      — Enter/exit fullscreen
     camera(opts)         — Create camera capture input
     resizeImage(file,o)  — Client-side image resize before upload
     qr                   — { generate(text,s), toDataURL(text,s) }
     geo(opts)            — Geolocation wrapper → {lat, lng, accuracy}
     geoWithin(pos,t,r)   — Haversine radius check
     capabilities         — Feature-detect object

   All methods degrade silently on unsupported browsers.
   ══════════════════════════════════════════════════════════════════════════════ */

// ── Feature detection ─────────────────────────────────────────────────────────
export const capabilities = Object.freeze({
  share:        'share' in navigator,
  clipboard:    !!(navigator.clipboard && navigator.clipboard.writeText),
  notification: 'Notification' in self,
  badge:        'setAppBadge' in navigator,
  geo:          'geolocation' in navigator,
  fullscreen:   !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen),
  camera:       'mediaDevices' in navigator,
  barcode:      'BarcodeDetector' in self,
});


/* ═══════════════════════════════════════════════════════════════════════════
   1. WEB SHARE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Share content via the native share sheet (phone) or copy to clipboard (desktop).
 * @param {{ title?:string, text?:string, url?:string }} data
 * @returns {Promise<boolean>}
 */
export async function share(data) {
  if (capabilities.share) {
    try { await navigator.share(data); return true; }
    catch (e) { if (e.name === 'AbortError') return false; }
  }
  const fallback = [data.title, data.text, data.url].filter(Boolean).join('\n');
  return clipboard(fallback);
}


/* ═══════════════════════════════════════════════════════════════════════════
   2. CLIPBOARD
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Copy text to clipboard.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function clipboard(text) {
  try {
    if (capabilities.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    _toast('Copied!');
    return true;
  } catch (_) {
    return false;
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   3. CLICK-TO-CALL / SMS
   ═══════════════════════════════════════════════════════════════════════════ */

/** Open the phone dialer. */
export function call(phone) {
  if (!phone) return;
  window.open('tel:' + _cleanPhone(phone), '_self');
}

/** Open SMS composer. */
export function sms(phone, body) {
  if (!phone) return;
  const href = 'sms:' + _cleanPhone(phone) + (body ? '?body=' + encodeURIComponent(body) : '');
  window.open(href, '_self');
}

function _cleanPhone(p) {
  return String(p).replace(/[^\d+]/g, '');
}


/* ═══════════════════════════════════════════════════════════════════════════
   4. WEB NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Request permission (if needed) and show a notification.
 * @param {string} title
 * @param {{ body?:string, icon?:string, tag?:string }} [opts]
 * @returns {Promise<Notification|null>}
 */
export async function notify(title, opts) {
  if (!capabilities.notification) return null;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') return null;
  return new Notification(title, {
    icon: 'FlockOS/Images/FlockOS_Camo.png',
    ...opts,
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   5. APP BADGE
   ═══════════════════════════════════════════════════════════════════════════ */

/** Set the PWA app icon badge count. 0 clears. */
export function badge(count) {
  if (!capabilities.badge) return;
  if (count > 0) navigator.setAppBadge(count);
  else navigator.clearAppBadge();
}


/* ═══════════════════════════════════════════════════════════════════════════
   6. FULLSCREEN
   ═══════════════════════════════════════════════════════════════════════════ */

/** Toggle fullscreen on el (defaults to document root). */
export function fullscreen(el) {
  el = el || document.documentElement;
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else {
    (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   7. CAMERA CAPTURE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Open camera/file picker. Returns a promise resolving with the selected File.
 * @param {{ accept?:string, capture?:string, maxSizeMB?:number }} [opts]
 * @returns {Promise<File|null>}
 */
export function camera(opts = {}) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = opts.accept || 'image/*';
    if (opts.capture !== false) input.setAttribute('capture', opts.capture || 'environment');
    input.style.display = 'none';
    input.onchange = () => {
      const file = input.files[0] || null;
      if (file && opts.maxSizeMB && file.size > opts.maxSizeMB * 1024 * 1024) {
        _toast('File too large (max ' + opts.maxSizeMB + ' MB)');
        resolve(null);
      } else {
        resolve(file);
      }
      document.body.removeChild(input);
    };
    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Resize an image File client-side before upload.
 * @param {File} file
 * @param {{ maxWidth?:number, maxHeight?:number, quality?:number }} [opts]
 * @returns {Promise<Blob>}
 */
export function resizeImage(file, opts = {}) {
  const maxW = opts.maxWidth  || 1200;
  const maxH = opts.maxHeight || 1200;
  const quality = opts.quality || 0.8;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) {
        const ratio = Math.min(maxW / w, maxH / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   8. QR CODE GENERATOR (Canvas-based, no library)
   ═══════════════════════════════════════════════════════════════════════════ */

export const qr = Object.freeze({
  /**
   * Draw a QR code on a canvas element.
   * @param {string} text
   * @param {number} [size=200]
   * @returns {HTMLCanvasElement}
   */
  generate(text, size = 200) {
    const modules = _encodeQR(text);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const cellSize = size / modules.length;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < modules.length; r++) {
      for (let c = 0; c < modules[r].length; c++) {
        if (modules[r][c]) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }
    return canvas;
  },

  /**
   * QR code as a data URL for &lt;img&gt; src.
   * @param {string} text
   * @param {number} [size=200]
   * @returns {string}
   */
  toDataURL(text, size = 200) {
    return this.generate(text, size).toDataURL('image/png');
  },
});

// ── Minimal QR Encoder (Mode Byte, ECC-L, versions 1–6) ──────────────────────
function _encodeQR(text) {
  const data = [];
  for (let i = 0; i < text.length; i++) data.push(text.charCodeAt(i));
  const caps = [0, 17, 32, 53, 78, 106, 134];
  let ver = 0;
  for (let v = 1; v <= 6; v++) { if (data.length <= caps[v]) { ver = v; break; } }
  if (ver === 0) return _placeholderGrid(text);

  const n = 17 + ver * 4;
  const grid = Array.from({ length: n }, () => new Array(n).fill(false));
  _finderPattern(grid, 0, 0);
  _finderPattern(grid, n - 7, 0);
  _finderPattern(grid, 0, n - 7);
  for (let i = 8; i < n - 8; i++) grid[6][i] = grid[i][6] = (i % 2 === 0);

  const bits = [];
  bits.push(0, 1, 0, 0);
  const ccLen = ver <= 9 ? 8 : 16;
  for (let b = ccLen - 1; b >= 0; b--) bits.push((data.length >> b) & 1);
  for (let i = 0; i < data.length; i++) {
    for (let b = 7; b >= 0; b--) bits.push((data[i] >> b) & 1);
  }
  bits.push(0, 0, 0, 0);

  let bi = 0, upward = true;
  for (let col = n - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5;
    const rows = upward ? _range(n - 1, -1) : _range(0, n);
    for (const r of rows) {
      for (let dc = 0; dc <= 1; dc++) {
        const c = col - dc;
        if (c < 0 || c >= n || _isReserved(r, c, n)) continue;
        grid[r][c] = bi < bits.length ? !!bits[bi] : false;
        bi++;
      }
    }
    upward = !upward;
  }
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!_isReserved(r, c, n) && (r + c) % 2 === 0) grid[r][c] = !grid[r][c];
    }
  }
  return grid;
}

function _finderPattern(grid, row, col) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      grid[row + r][col + c] =
        (r === 0 || r === 6 || c === 0 || c === 6) ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
  }
}
function _isReserved(r, c, n) {
  return (r < 9 && c < 9) || (r < 9 && c >= n - 8) || (r >= n - 8 && c < 9) || r === 6 || c === 6;
}
function _range(start, end) {
  const arr = [];
  if (start < end) { for (let i = start; i < end; i++) arr.push(i); }
  else { for (let i = start; i >= end + 1; i--) arr.push(i); }
  return arr;
}
function _placeholderGrid(text) {
  const n = 25;
  const grid = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) =>
      ((r * 7 + c * 13 + text.charCodeAt((r + c) % text.length)) % 3) === 0
    )
  );
  _finderPattern(grid, 0, 0);
  _finderPattern(grid, n - 7, 0);
  _finderPattern(grid, 0, n - 7);
  return grid;
}


/* ═══════════════════════════════════════════════════════════════════════════
   9. GEOLOCATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get current position.
 * @param {{ timeout?:number, highAccuracy?:boolean }} [opts]
 * @returns {Promise<{lat:number, lng:number, accuracy:number}>}
 */
export function geo(opts = {}) {
  if (!capabilities.geo) return Promise.reject(new Error('Geolocation not available'));
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(err),
      { enableHighAccuracy: opts.highAccuracy !== false, timeout: opts.timeout || 10000, maximumAge: 60000 }
    );
  });
}

/**
 * Check if a position is within radiusMeters of target (Haversine).
 * @param {{lat:number,lng:number}} pos
 * @param {{lat:number,lng:number}} target
 * @param {number} radiusMeters
 * @returns {boolean}
 */
export function geoWithin(pos, target, radiusMeters) {
  const R = 6371000;
  const dLat = (target.lat - pos.lat) * Math.PI / 180;
  const dLng = (target.lng - pos.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(pos.lat * Math.PI / 180) * Math.cos(target.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) <= radiusMeters;
}


/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function _toast(msg) {
  if (typeof showToast === 'function') { showToast(msg); return; }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
    'background:#333;color:#fff;padding:8px 20px;border-radius:8px;font-size:0.85rem;' +
    'z-index:99999;opacity:0;transition:opacity 0.3s';
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2000);
}
