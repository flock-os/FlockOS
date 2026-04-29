/* ══════════════════════════════════════════════════════════════════════════════
   THE WAY — Learning hub: courses, quizzes, reading, theology, lexicon, etc.
   "I am the way, the truth, and the life." — John 14:6
   ══════════════════════════════════════════════════════════════════════════════ */

import { bridge, when, callWhen } from '../the_legacy_bridge.js';

const NAME = 'TheWay';

export const ready = () => when(NAME);
export const live  = () => bridge(NAME);

export const listCourses     = (...a) => callWhen(NAME, 'listCourses', ...a);
export const enrolCourse     = (...a) => callWhen(NAME, 'enrolCourse', ...a);
export const submitQuiz      = (...a) => callWhen(NAME, 'submitQuiz', ...a);
export const readingPlan     = (...a) => callWhen(NAME, 'readingPlan', ...a);
export const lexiconLookup   = (...a) => callWhen(NAME, 'lexiconLookup', ...a);
export const apologeticsList = (...a) => callWhen(NAME, 'apologeticsList', ...a);
export const counselingList  = (...a) => callWhen(NAME, 'counselingList', ...a);
export const devotionalToday = (...a) => callWhen(NAME, 'devotionalToday', ...a);
export const certificateFor  = (...a) => callWhen(NAME, 'certificateFor', ...a);
export const analyticsFor    = (...a) => callWhen(NAME, 'analyticsFor', ...a);
