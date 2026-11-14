/* i18n core for Last-Minute Pricing, arcade cut: English only.
 *
 *   Holds the engine plus the small set of shared strings (the topbar
 *   chrome, the pricing vocabulary, the lever names, the demand deck).
 *   Every kept scene ships its copy in js/i18n/sceneN.i18n.js, which calls
 *   window.I18N.register({ en: {...} }) at load time.
 *
 *   Public API:
 *     I18N.register(obj)   merge obj.en into the dictionary
 *     I18N.t(key, vars)    look up a key, interpolate {var} tokens, return
 *                          the key itself if missing
 *     I18N.current()       'en'
 */
(function () {
  /* Private dictionary. Scene fragments register into this. */
  const DICT = { en: {} };

  /* Merge a fragment's flat {en:{...}} string map in. */
  function register(obj) {
    if (!obj) return;
    if (obj.en) Object.assign(DICT.en, obj.en);
  }

  /*, SHARED strings only (scene copy lives in fragments), */
  register({
    en: {
      /* topbar / chrome */
      'brand':        'AI in Industry · PRICING',
      'topbar.prev':  'PREV',
      'topbar.next':  'NEXT',
      'music.on':     '♪ MUSIC ON',
      'music.off':    '♪ MUSIC OFF',

      /* common pricing vocabulary, reused across scenes */
      'vocab.units':     'seats',
      'vocab.unit':      'seat',
      'vocab.days':      'days',
      'vocab.day':       'day',
      'vocab.deadline':  'DEPARTURE',
      'vocab.midnight':  'GATE CLOSED',
      'vocab.soldout':   'FULL FLIGHT',
      'vocab.dollar':    '$',
      'vocab.revenue':   'REVENUE',
      'vocab.demand':    'DEMAND',
      'vocab.sold':      'sold',

      /* the three price-lever names (canonical labels) */
      'lever.premium':        'PREMIUM',
      'lever.standard':       'STANDARD',
      'lever.firesale':       'FIRE-SALE',
      'lever.premium.short':  'PREM',
      'lever.standard.short': 'STD',
      'lever.firesale.short': 'FIRE',

      /* shared demand-deck labels (window.Deck) */
      'deck.flip':        'FLIP',
      'deck.sold':        '{k} SOLD',
      'deck.none':        'NONE SOLD',
    },
  });

  /* English only: the arcade cut has no language toggle. */
  const lang = 'en';

  function t(key, vars) {
    const table = DICT[lang] || DICT.en;
    let s = table[key];
    if (s === undefined) s = (DICT.en[key] !== undefined) ? DICT.en[key] : key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : '{' + k + '}'));
    }
    return s;
  }

  function current() { return lang; }

  window.I18N = {
    get lang() { return lang; },
    register, t, current,
  };
})();
