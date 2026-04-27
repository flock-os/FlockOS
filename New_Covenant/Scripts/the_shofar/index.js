/* ══════════════════════════════════════════════════════════════════════════════
   THE SHOFAR — Music Stand: songs, arrangements, setlists, ChordPro renderer
   "And it shall come to pass, that when they make a long blast
    with the ram’s horn…" — Joshua 6:5

   Phase I: pure shim over the legacy `the_shofar` IIFE. The aggressive split
   (the_state, the_auth, the_styles, the_shell, the_songs_tab, the_song_detail,
   the_arrangement_view, the_song_editor, the_arr_editor, the_stand_tab,
   the_stand_view, the_transpose, the_chordpro, the_pdf, the_song_select_import,
   the_helpers) lands in Phase II.
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'shofar';   // legacy IIFE exposes itself as window.shofar

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const open       = (...a) => callWhen(NAME, 'open', ...a);
export const songs      = (...a) => callWhen(NAME, 'songs', ...a);
export const setlists   = (...a) => callWhen(NAME, 'setlists', ...a);
export const stand      = (...a) => callWhen(NAME, 'stand', ...a);
export const transpose  = (...a) => callWhen(NAME, 'transpose', ...a);
export const exportPdf  = (...a) => callWhen(NAME, 'exportPdf', ...a);
