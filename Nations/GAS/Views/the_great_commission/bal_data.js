/* ══════════════════════════════════════════════════════════════════════════════
   BIBLE ACCESS LIST — Restrictions Rank (2025 edition)
   Source: https://bibleaccesslist.org/en/
   Stewards: Bible Access Initiative (Open Doors, Digital Bible Society,
             Bible League International, Voice of the Martyrs, et al.)

   This is the CHIEF DRIVER of country sort order in The Great Commission view.
   Joshua Project data is layered on top for everything else, but persecution
   tier and primary sort key come from this list.

   Tier bands (per BAL):
     1 – 15  Extreme Restrictions
     16 – 33 Severe Restrictions
     34 – 50 Considerable Restrictions
     51 – 55 Some Restrictions
     56 – 88 Minimal Restrictions
   ══════════════════════════════════════════════════════════════════════════════ */

export const BAL_TIER_BANDS = [
  { max: 15, tier: 'Extreme'      },
  { max: 33, tier: 'Severe'       },
  { max: 50, tier: 'Considerable' },
  { max: 55, tier: 'Some'         },
  { max: 88, tier: 'Minimal'      },
];

export function balTierForRank(rank) {
  const n = parseInt(rank, 10);
  if (!n || n < 1) return '';
  for (const b of BAL_TIER_BANDS) if (n <= b.max) return b.tier;
  return '';
}

// Keyed by ISO 3166-1 alpha-2. Country names match BAL display names; some
// differ from JP (e.g., "Viet nam" → Vietnam, "Türkiye" → Turkey).
export const BAL_RANKS = {
  SO: { rank:  1, name: 'Somalia'                   },
  AF: { rank:  2, name: 'Afghanistan'               },
  YE: { rank:  3, name: 'Yemen'                     },
  KP: { rank:  4, name: 'North Korea'               },
  MR: { rank:  5, name: 'Mauritania'                },
  ER: { rank:  6, name: 'Eritrea'                   },
  LY: { rank:  7, name: 'Libya'                     },
  DZ: { rank:  8, name: 'Algeria'                   },
  IR: { rank:  9, name: 'Iran'                      },
  TM: { rank: 10, name: 'Turkmenistan'              },
  SD: { rank: 11, name: 'Sudan'                     },
  MV: { rank: 12, name: 'Maldives'                  },
  KM: { rank: 13, name: 'Comoros'                   },
  TN: { rank: 14, name: 'Tunisia'                   },
  TJ: { rank: 15, name: 'Tajikistan'                },
  BT: { rank: 16, name: 'Bhutan'                    },
  MA: { rank: 17, name: 'Morocco'                   },
  SA: { rank: 18, name: 'Saudi Arabia'              },
  OM: { rank: 19, name: 'Oman'                      },
  PK: { rank: 20, name: 'Pakistan'                  },
  LA: { rank: 21, name: 'Laos'                      },
  BN: { rank: 22, name: 'Brunei'                    },
  NE: { rank: 23, name: 'Niger'                     },
  UZ: { rank: 24, name: 'Uzbekistan'                },
  CN: { rank: 25, name: 'China'                     },
  KG: { rank: 26, name: 'Kyrgyzstan'                },
  KZ: { rank: 27, name: 'Kazakhstan'                },
  CF: { rank: 28, name: 'Central African Republic'  },
  BF: { rank: 29, name: 'Burkina Faso'              },
  AZ: { rank: 30, name: 'Azerbaijan'                },
  MZ: { rank: 31, name: 'Mozambique'                },
  KW: { rank: 32, name: 'Kuwait'                    },
  QA: { rank: 33, name: 'Qatar'                     },
  IQ: { rank: 34, name: 'Iraq'                      },
  SY: { rank: 35, name: 'Syria'                     },
  DJ: { rank: 36, name: 'Djibouti'                  },
  BH: { rank: 37, name: 'Bahrain'                   },
  NG: { rank: 38, name: 'Nigeria'                   },
  NP: { rank: 39, name: 'Nepal'                     },
  CU: { rank: 40, name: 'Cuba'                      },
  VN: { rank: 41, name: 'Vietnam'                   },
  IN: { rank: 42, name: 'India'                     },
  ML: { rank: 43, name: 'Mali'                      },
  AE: { rank: 44, name: 'United Arab Emirates'      },
  MY: { rank: 45, name: 'Malaysia'                  },
  MM: { rank: 46, name: 'Myanmar'                   },
  BD: { rank: 47, name: 'Bangladesh'                },
  TD: { rank: 48, name: 'Chad'                      },
  JO: { rank: 49, name: 'Jordan'                    },
  ID: { rank: 50, name: 'Indonesia'                 },
  EG: { rank: 51, name: 'Egypt'                     },
  CD: { rank: 52, name: 'DR Congo'                  },
  ET: { rank: 53, name: 'Ethiopia'                  },
  CM: { rank: 54, name: 'Cameroon'                  },
  PS: { rank: 55, name: 'Palestinian Territories'   },
  GN: { rank: 56, name: 'Guinea'                    },
  SS: { rank: 57, name: 'South Sudan'               },
  TG: { rank: 58, name: 'Togo'                      },
  TR: { rank: 59, name: 'Türkiye'                   },
  UG: { rank: 60, name: 'Uganda'                    },
  KE: { rank: 61, name: 'Kenya'                     },
  MG: { rank: 62, name: 'Madagascar'                },
  TZ: { rank: 63, name: 'Tanzania'                  },
  LB: { rank: 64, name: 'Lebanon'                   },
  MW: { rank: 65, name: 'Malawi'                    },
  CO: { rank: 66, name: 'Colombia'                  },
  RU: { rank: 67, name: 'Russia'                    },
  BJ: { rank: 68, name: 'Benin'                     },
  CI: { rank: 69, name: 'Ivory Coast'               },
  NI: { rank: 70, name: 'Nicaragua'                 },
  UA: { rank: 71, name: 'Ukraine'                   },
  KH: { rank: 72, name: 'Cambodia'                  },
  VE: { rank: 73, name: 'Venezuela'                 },
  MX: { rank: 74, name: 'Mexico'                    },
  LK: { rank: 75, name: 'Sri Lanka'                 },
  BI: { rank: 76, name: 'Burundi'                   },
  HT: { rank: 77, name: 'Haiti'                     },
  PH: { rank: 78, name: 'Philippines'               },
  RW: { rank: 79, name: 'Rwanda'                    },
  GH: { rank: 80, name: 'Ghana'                     },
  ZW: { rank: 81, name: 'Zimbabwe'                  },
  HN: { rank: 82, name: 'Honduras'                  },
  GT: { rank: 83, name: 'Guatemala'                 },
  NA: { rank: 84, name: 'Namibia'                   },
  SV: { rank: 85, name: 'El Salvador'               },
  EC: { rank: 86, name: 'Ecuador'                   },
  AM: { rank: 87, name: 'Armenia'                   },
  BR: { rank: 88, name: 'Brazil'                    },
};

// Fallback name → ISO map for records that lack a clean isoCode.
// Includes common JP/legacy spellings.
export const BAL_NAME_TO_ISO = (() => {
  const m = {};
  for (const [iso, v] of Object.entries(BAL_RANKS)) {
    m[v.name.toLowerCase()] = iso;
  }
  // Common alternates
  Object.assign(m, {
    'viet nam':                      'VN',
    'vietnam':                       'VN',
    'turkey':                        'TR',
    'turkiye':                       'TR',
    'türkiye':                       'TR',
    'democratic republic of congo':  'CD',
    'congo, dr':                     'CD',
    'congo (kinshasa)':              'CD',
    'dr congo':                      'CD',
    'drc':                           'CD',
    'palestine':                     'PS',
    'west bank and gaza':            'PS',
    'palestinian territory':         'PS',
    "côte d'ivoire":                 'CI',
    'cote d ivoire':                 'CI',
    'cote d\'ivoire':                'CI',
    'ivory coast':                   'CI',
    'cape verde':                    'CV',
    'eswatini':                      'SZ',
    'swaziland':                     'SZ',
    'czechia':                       'CZ',
    'czech republic':                'CZ',
    'burma':                         'MM',
    'south korea':                   'KR',
    'korea, north':                  'KP',
    'korea, south':                  'KR',
    'united states':                 'US',
    'united kingdom':                'GB',
    'east timor':                    'TL',
    'timor-leste':                   'TL',
  });
  return m;
})();

export function balLookup(isoCode, countryName) {
  const iso = String(isoCode || '').trim().toUpperCase();
  if (iso.length === 2 && BAL_RANKS[iso]) return { iso, ...BAL_RANKS[iso] };
  const nm = String(countryName || '').trim().toLowerCase();
  if (nm) {
    const mappedIso = BAL_NAME_TO_ISO[nm];
    if (mappedIso && BAL_RANKS[mappedIso]) return { iso: mappedIso, ...BAL_RANKS[mappedIso] };
  }
  return null;
}

/* ──────────────────────────────────────────────────────────────────────────────
   BIBLE ACCESS — Shortage / Need Rank (BAL "Bible Access" tab, 2025)
   Source: https://bibleaccesslist.org/en/  (separate ranking from restrictions)

   This list ranks 76 countries by SCALE OF UNMET BIBLE NEED (number of people
   without access to a Bible). Rank 1 = greatest shortage. Many large‑population
   high‑Christian nations (DR Congo, Nigeria, Ethiopia, India) appear here even
   though they have low restrictions, because the absolute shortfall is huge.

   Tier bands derived from BAL's published ranges:
      "More than ten million"                      → Critical
      "Between five and ten million"               → Critical
      "Between three and five million"             → Severe
      "Between one and three million"              → Severe
      "Between five hundred thousand and one million"   → High
      "Between two hundred fifty and five hundred thousand" → High
      "Between one hundred and two hundred fifty thousand"  → Moderate
      "Between fifty and one hundred thousand"     → Moderate
      "Between twenty-five and fifty thousand"     → Limited
      "Between ten and twenty-five thousand"       → Limited
      "Less than ten thousand"                     → Minor
   ────────────────────────────────────────────────────────────────────────────── */

export const BAL_SHORTAGE = {
  CD: { rank:  1, name: 'DR Congo',                 range: 'More than ten million' },
  NG: { rank:  2, name: 'Nigeria',                  range: 'More than ten million' },
  ET: { rank:  3, name: 'Ethiopia',                 range: 'More than ten million' },
  IN: { rank:  4, name: 'India',                    range: 'More than ten million' },
  CN: { rank:  5, name: 'China',                    range: 'Between five and ten million' },
  TZ: { rank:  6, name: 'Tanzania',                 range: 'Between five and ten million' },
  UG: { rank:  7, name: 'Uganda',                   range: 'Between three and five million' },
  MZ: { rank:  8, name: 'Mozambique',               range: 'Between three and five million' },
  ID: { rank:  9, name: 'Indonesia',                range: 'Between three and five million' },
  MG: { rank: 10, name: 'Madagascar',               range: 'Between one and three million' },
  MW: { rank: 11, name: 'Malawi',                   range: 'Between one and three million' },
  ZW: { rank: 12, name: 'Zimbabwe',                 range: 'Between one and three million' },
  CM: { rank: 13, name: 'Cameroon',                 range: 'Between one and three million' },
  RW: { rank: 14, name: 'Rwanda',                   range: 'Between one and three million' },
  BI: { rank: 15, name: 'Burundi',                  range: 'Between one and three million' },
  HT: { rank: 16, name: 'Haiti',                    range: 'Between one and three million' },
  CU: { rank: 17, name: 'Cuba',                     range: 'Between one and three million' },
  BF: { rank: 18, name: 'Burkina Faso',             range: 'Between one and three million' },
  KE: { rank: 19, name: 'Kenya',                    range: 'Between one and three million' },
  PK: { rank: 20, name: 'Pakistan',                 range: 'Between five hundred thousand and one million' },
  CF: { rank: 21, name: 'Central African Republic', range: 'Between five hundred thousand and one million' },
  SS: { rank: 22, name: 'South Sudan',              range: 'Between five hundred thousand and one million' },
  TG: { rank: 23, name: 'Togo',                     range: 'Between five hundred thousand and one million' },
  VN: { rank: 24, name: 'Vietnam',                  range: 'Between five hundred thousand and one million' },
  EG: { rank: 25, name: 'Egypt',                    range: 'Between five hundred thousand and one million' },
  TD: { rank: 26, name: 'Chad',                     range: 'Between five hundred thousand and one million' },
  GH: { rank: 27, name: 'Ghana',                    range: 'Between five hundred thousand and one million' },
  CI: { rank: 28, name: 'Ivory Coast',              range: 'Between five hundred thousand and one million' },
  BJ: { rank: 29, name: 'Benin',                    range: 'Between two hundred fifty and five hundred thousand' },
  NI: { rank: 30, name: 'Nicaragua',                range: 'Between two hundred fifty and five hundred thousand' },
  SD: { rank: 31, name: 'Sudan',                    range: 'Between two hundred fifty and five hundred thousand' },
  MM: { rank: 32, name: 'Myanmar',                  range: 'Between two hundred fifty and five hundred thousand' },
  NP: { rank: 33, name: 'Nepal',                    range: 'Between one hundred and two hundred fifty thousand' },
  BD: { rank: 34, name: 'Bangladesh',               range: 'Between one hundred and two hundred fifty thousand' },
  ER: { rank: 35, name: 'Eritrea',                  range: 'Between one hundred and two hundred fifty thousand' },
  MY: { rank: 36, name: 'Malaysia',                 range: 'Between one hundred and two hundred fifty thousand' },
  IR: { rank: 37, name: 'Iran',                     range: 'Between one hundred and two hundred fifty thousand' },
  AM: { rank: 38, name: 'Armenia',                  range: 'Between one hundred and two hundred fifty thousand' },
  LK: { rank: 39, name: 'Sri Lanka',                range: 'Between fifty and one hundred thousand' },
  SA: { rank: 40, name: 'Saudi Arabia',             range: 'Between fifty and one hundred thousand' },
  SY: { rank: 41, name: 'Syria',                    range: 'Between fifty and one hundred thousand' },
  KH: { rank: 42, name: 'Cambodia',                 range: 'Between fifty and one hundred thousand' },
  GN: { rank: 43, name: 'Guinea',                   range: 'Between fifty and one hundred thousand' },
  KZ: { rank: 44, name: 'Kazakhstan',               range: 'Between fifty and one hundred thousand' },
  KP: { rank: 45, name: 'North Korea',              range: 'Between fifty and one hundred thousand' },
  ML: { rank: 46, name: 'Mali',                     range: 'Between twenty-five and fifty thousand' },
  QA: { rank: 47, name: 'Qatar',                    range: 'Between twenty-five and fifty thousand' },
  TR: { rank: 48, name: 'Türkiye',                  range: 'Between twenty-five and fifty thousand' },
  AZ: { rank: 49, name: 'Azerbaijan',               range: 'Between twenty-five and fifty thousand' },
  UZ: { rank: 50, name: 'Uzbekistan',               range: 'Between twenty-five and fifty thousand' },
  KW: { rank: 51, name: 'Kuwait',                   range: 'Between twenty-five and fifty thousand' },
  LB: { rank: 52, name: 'Lebanon',                  range: 'Between twenty-five and fifty thousand' },
  AE: { rank: 53, name: 'United Arab Emirates',     range: 'Between twenty-five and fifty thousand' },
  BH: { rank: 54, name: 'Bahrain',                  range: 'Between ten and twenty-five thousand' },
  LA: { rank: 55, name: 'Laos',                     range: 'Between ten and twenty-five thousand' },
  JO: { rank: 56, name: 'Jordan',                   range: 'Between ten and twenty-five thousand' },
  NE: { rank: 57, name: 'Niger',                    range: 'Between ten and twenty-five thousand' },
  KG: { rank: 58, name: 'Kyrgyzstan',               range: 'Between ten and twenty-five thousand' },
  IQ: { rank: 59, name: 'Iraq',                     range: 'Between ten and twenty-five thousand' },
  TM: { rank: 60, name: 'Turkmenistan',             range: 'Less than ten thousand' },
  DZ: { rank: 61, name: 'Algeria',                  range: 'Less than ten thousand' },
  BT: { rank: 62, name: 'Bhutan',                   range: 'Less than ten thousand' },
  OM: { rank: 63, name: 'Oman',                     range: 'Less than ten thousand' },
  BN: { rank: 64, name: 'Brunei',                   range: 'Less than ten thousand' },
  LY: { rank: 65, name: 'Libya',                    range: 'Less than ten thousand' },
  TJ: { rank: 66, name: 'Tajikistan',               range: 'Less than ten thousand' },
  PS: { rank: 67, name: 'Palestinian Territories',  range: 'Less than ten thousand' },
  TN: { rank: 68, name: 'Tunisia',                  range: 'Less than ten thousand' },
  MA: { rank: 69, name: 'Morocco',                  range: 'Less than ten thousand' },
  MR: { rank: 70, name: 'Mauritania',               range: 'Less than ten thousand' },
  AF: { rank: 71, name: 'Afghanistan',              range: 'Less than ten thousand' },
  YE: { rank: 72, name: 'Yemen',                    range: 'Less than ten thousand' },
  DJ: { rank: 73, name: 'Djibouti',                 range: 'Less than ten thousand' },
  KM: { rank: 74, name: 'Comoros',                  range: 'Less than ten thousand' },
  MV: { rank: 75, name: 'Maldives',                 range: 'Less than ten thousand' },
  SO: { rank: 76, name: 'Somalia',                  range: 'Less than ten thousand' },
};

const _SHORTAGE_BAND_TO_TIER = [
  { match: /more than ten million|five and ten million/i,     tier: 'Critical' },
  { match: /three and five million|one and three million/i,   tier: 'Severe'   },
  { match: /five hundred thousand and one million|two hundred fifty and five hundred thousand/i, tier: 'High' },
  { match: /one hundred and two hundred fifty thousand|fifty and one hundred thousand/i,         tier: 'Moderate' },
  { match: /twenty-five and fifty thousand|ten and twenty-five thousand/i,    tier: 'Limited'  },
  { match: /less than ten thousand/i,                          tier: 'Minor'    },
];

export function balShortageTierForRange(range) {
  const s = String(range || '');
  for (const b of _SHORTAGE_BAND_TO_TIER) if (b.match.test(s)) return b.tier;
  return '';
}

export function balShortageLookup(isoCode, countryName) {
  const iso = String(isoCode || '').trim().toUpperCase();
  if (iso.length === 2 && BAL_SHORTAGE[iso]) return { iso, ...BAL_SHORTAGE[iso] };
  const nm = String(countryName || '').trim().toLowerCase();
  if (nm) {
    const mappedIso = BAL_NAME_TO_ISO[nm];
    if (mappedIso && BAL_SHORTAGE[mappedIso]) return { iso: mappedIso, ...BAL_SHORTAGE[mappedIso] };
  }
  return null;
}
