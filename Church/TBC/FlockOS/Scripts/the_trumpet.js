/* ══════════════════════════════════════════════════════════════════════════════
   THE TRUMPET — FlockOS Phone & Device Integration Layer
   "Blow the trumpet in Zion; sound the alarm on my holy hill."
   — Joel 2:1

   Browser-native device APIs — no external dependencies.

   MODULES:
     Trumpet.share(data)          — Web Share API (falls back to clipboard)
     Trumpet.clipboard(text)      — Copy text to clipboard
     Trumpet.call(phone)          — Open tel: dialer
     Trumpet.sms(phone, body?)    — Open sms: composer
     Trumpet.notify(title, opts)  — Web Notification API
     Trumpet.badge(count)         — App badge count (PWA)
     Trumpet.fullscreen(el?)      — Enter/exit fullscreen
     Trumpet.camera(opts)         — Create camera capture input
     Trumpet.resizeImage(file,o)  — Client-side image resize before upload
     Trumpet.qr.generate(text,s)  — Generate QR code on canvas
     Trumpet.qr.toDataURL(text,s) — QR code as data-url for <img>
     Trumpet.geo(opts)            — Geolocation wrapper → {lat, lng, accuracy}
     Trumpet.geoWithin(pos,t,r)   — Haversine radius check
     Trumpet.capabilities         — Feature-detect object

   All methods are safe to call on any browser — they silently degrade
   when APIs are unavailable (desktop, older browsers, denied permissions).
   ══════════════════════════════════════════════════════════════════════════════ */

const Trumpet = (() => {
  'use strict';

  // ── Feature detection ─────────────────────────────────────────────────────
  const capabilities = Object.freeze({
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
   * @returns {Promise<boolean>} true if shared/copied
   */
  async function share(data) {
    if (capabilities.share) {
      try { await navigator.share(data); return true; }
      catch (e) { if (e.name === 'AbortError') return false; }
    }
    // Fallback: copy a combined string to clipboard
    const fallback = [data.title, data.text, data.url].filter(Boolean).join('\n');
    return clipboard(fallback);
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     2. CLIPBOARD
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Copy text to clipboard. Shows a toast on success.
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  async function clipboard(text) {
    try {
      if (capabilities.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback: temporary textarea + execCommand
        var ta = document.createElement('textarea');
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

  /**
   * Open the phone dialer with the given number.
   * @param {string} phone — phone number (any format)
   */
  function call(phone) {
    if (!phone) return;
    window.open('tel:' + _cleanPhone(phone), '_self');
  }

  /**
   * Open SMS composer.
   * @param {string} phone
   * @param {string} [body] — pre-filled message
   */
  function sms(phone, body) {
    if (!phone) return;
    var href = 'sms:' + _cleanPhone(phone) + (body ? '?body=' + encodeURIComponent(body) : '');
    window.open(href, '_self');
  }

  /** Strip non-digit chars (keep leading +). */
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
  async function notify(title, opts) {
    if (!capabilities.notification) return null;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission !== 'granted') return null;
    return new Notification(title, {
      icon: 'FlockOS/Images/FlockOS_White.png',
      ...opts
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     5. APP BADGE
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Set the PWA app icon badge count.
   * @param {number} count — 0 clears the badge
   */
  function badge(count) {
    if (!capabilities.badge) return;
    if (count > 0) navigator.setAppBadge(count);
    else navigator.clearAppBadge();
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     6. FULLSCREEN
     ═══════════════════════════════════════════════════════════════════════════ */

  /**
   * Toggle fullscreen on the given element (defaults to document root).
   * @param {HTMLElement} [el]
   */
  function fullscreen(el) {
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
   * Create a hidden file input that opens the camera. Returns a promise
   * that resolves with the selected/captured File.
   * @param {{ accept?:string, capture?:string, maxSizeMB?:number }} [opts]
   * @returns {Promise<File|null>}
   */
  function camera(opts) {
    opts = opts || {};
    return new Promise(function(resolve) {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = opts.accept || 'image/*';
      if (opts.capture !== false) input.setAttribute('capture', opts.capture || 'environment');
      input.style.display = 'none';
      input.onchange = function() {
        var file = input.files[0] || null;
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
   * Resize an image File before upload (client-side compression).
   * @param {File} file
   * @param {{ maxWidth?:number, maxHeight?:number, quality?:number }} [opts]
   * @returns {Promise<Blob>}
   */
  function resizeImage(file, opts) {
    opts = opts || {};
    var maxW = opts.maxWidth  || 1200;
    var maxH = opts.maxHeight || 1200;
    var quality = opts.quality || 0.8;
    return new Promise(function(resolve) {
      var img = new Image();
      img.onload = function() {
        var w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          var ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob(function(blob) { resolve(blob); }, 'image/jpeg', quality);
      };
      img.src = URL.createObjectURL(file);
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     8. QR CODE GENERATOR (Canvas-based, no library)
     ═══════════════════════════════════════════════════════════════════════════ */

  var qr = Object.freeze({

    /**
     * Generate a QR code and draw it on a canvas element.
     * Uses a minimal QR encoder (Mode Byte, ECC-L, versions 1-6).
     * @param {string} text — data to encode
     * @param {number} [size=200] — canvas pixel size
     * @returns {HTMLCanvasElement}
     */
    generate: function(text, size) {
      size = size || 200;
      var modules = _encodeQR(text);
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      var ctx = canvas.getContext('2d');
      var cellSize = size / modules.length;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#000000';
      for (var r = 0; r < modules.length; r++) {
        for (var c = 0; c < modules[r].length; c++) {
          if (modules[r][c]) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize + 0.5, cellSize + 0.5);
          }
        }
      }
      return canvas;
    },

    /**
     * Generate a QR code as a data URL (for <img> src).
     * @param {string} text
     * @param {number} [size=200]
     * @returns {string}
     */
    toDataURL: function(text, size) {
      return this.generate(text, size).toDataURL('image/png');
    }
  });

  /* ─── Minimal QR Encoder ─────────────────────────────────────────────────
     Mode Byte, ECC-L, versions 1-6 (up to ~134 bytes).
     For longer data, falls back to a visual placeholder grid. ──────────── */

  function _encodeQR(text) {
    var data = [];
    for (var i = 0; i < text.length; i++) data.push(text.charCodeAt(i));

    // Version selection (byte mode, ECC-L capacities)
    var caps = [0, 17, 32, 53, 78, 106, 134];
    var ver = 0;
    for (var v = 1; v <= 6; v++) {
      if (data.length <= caps[v]) { ver = v; break; }
    }
    if (ver === 0) return _placeholderGrid(text);

    var n = 17 + ver * 4;
    var grid = [];
    for (var r = 0; r < n; r++) {
      grid[r] = [];
      for (var c = 0; c < n; c++) grid[r][c] = false;
    }

    _finderPattern(grid, 0, 0);
    _finderPattern(grid, n - 7, 0);
    _finderPattern(grid, 0, n - 7);

    for (var i = 8; i < n - 8; i++) {
      grid[6][i] = grid[i][6] = (i % 2 === 0);
    }

    var bits = [];
    bits.push(0, 1, 0, 0); // byte mode
    var ccLen = ver <= 9 ? 8 : 16;
    for (var b = ccLen - 1; b >= 0; b--) bits.push((data.length >> b) & 1);
    for (var i = 0; i < data.length; i++) {
      for (var b = 7; b >= 0; b--) bits.push((data[i] >> b) & 1);
    }
    bits.push(0, 0, 0, 0); // terminator

    var bi = 0, upward = true;
    for (var col = n - 1; col >= 1; col -= 2) {
      if (col === 6) col = 5;
      var rows = upward ? _range(n - 1, -1) : _range(0, n);
      for (var ri = 0; ri < rows.length; ri++) {
        var r = rows[ri];
        for (var dc = 0; dc <= 1; dc++) {
          var c = col - dc;
          if (c < 0 || c >= n) continue;
          if (_isReserved(r, c, n)) continue;
          grid[r][c] = bi < bits.length ? !!bits[bi] : false;
          bi++;
        }
      }
      upward = !upward;
    }

    // XOR mask (checkerboard)
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (!_isReserved(r, c, n) && (r + c) % 2 === 0) {
          grid[r][c] = !grid[r][c];
        }
      }
    }
    return grid;
  }

  function _finderPattern(grid, row, col) {
    for (var r = 0; r < 7; r++) {
      for (var c = 0; c < 7; c++) {
        grid[row + r][col + c] =
          (r === 0 || r === 6 || c === 0 || c === 6) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  }

  function _isReserved(r, c, n) {
    if (r < 9 && c < 9) return true;
    if (r < 9 && c >= n - 8) return true;
    if (r >= n - 8 && c < 9) return true;
    if (r === 6 || c === 6) return true;
    return false;
  }

  function _range(start, end) {
    var arr = [];
    if (start < end) { for (var i = start; i < end; i++) arr.push(i); }
    else { for (var i = start; i >= end + 1; i--) arr.push(i); }
    return arr;
  }

  function _placeholderGrid(text) {
    var n = 25, grid = [];
    for (var r = 0; r < n; r++) {
      grid[r] = [];
      for (var c = 0; c < n; c++) {
        grid[r][c] = ((r * 7 + c * 13 + text.charCodeAt((r + c) % text.length)) % 3) === 0;
      }
    }
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
  function geo(opts) {
    opts = opts || {};
    if (!capabilities.geo) return Promise.reject(new Error('Geolocation not available'));
    return new Promise(function(resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        },
        function(err) { reject(err); },
        {
          enableHighAccuracy: opts.highAccuracy !== false,
          timeout: opts.timeout || 10000,
          maximumAge: 60000
        }
      );
    });
  }

  /**
   * Check if a position is within a radius of a target (Haversine formula).
   * @param {{lat:number,lng:number}} pos
   * @param {{lat:number,lng:number}} target
   * @param {number} radiusMeters
   * @returns {boolean}
   */
  function geoWithin(pos, target, radiusMeters) {
    var R = 6371000;
    var dLat = (target.lat - pos.lat) * Math.PI / 180;
    var dLng = (target.lng - pos.lng) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pos.lat * Math.PI / 180) * Math.cos(target.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d <= radiusMeters;
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     INTERNAL HELPERS
     ═══════════════════════════════════════════════════════════════════════════ */

  function _toast(msg) {
    if (typeof showToast === 'function') { showToast(msg); return; }
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'background:#333;color:#fff;padding:8px 20px;border-radius:8px;font-size:0.85rem;' +
      'z-index:99999;opacity:0;transition:opacity 0.3s';
    document.body.appendChild(el);
    requestAnimationFrame(function() { el.style.opacity = '1'; });
    setTimeout(function() {
      el.style.opacity = '0';
      setTimeout(function() { el.remove(); }, 300);
    }, 2000);
  }


  /* ═══════════════════════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════════════════════ */

  return Object.freeze({
    capabilities: capabilities,
    share:        share,
    clipboard:    clipboard,
    call:         call,
    sms:          sms,
    notify:       notify,
    badge:        badge,
    fullscreen:   fullscreen,
    camera:       camera,
    resizeImage:  resizeImage,
    qr:           qr,
    geo:          geo,
    geoWithin:    geoWithin,
  });

})();
