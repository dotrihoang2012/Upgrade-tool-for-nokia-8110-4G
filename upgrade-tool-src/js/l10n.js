(function (global) {
  'use strict';

  var RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'yi', 'ug', 'dv', 'ps', 'sd'];

  /* Default region per base language — maps "en" → "en-US.json" etc. */
  var DEFAULT_REGION = {
    af:'af-ZA', ar:'ar-SA', az:'az-Latn-AZ', be:'be-BY', bg:'bg-BG', bn:'bn-BD',
    bs:'bs-BA', cs:'cs-CZ', da:'da-DK', de:'de-DE', el:'el-GR', en:'en-US',
    es:'es-ES', et:'et-EE', fa:'fa-IR', fi:'fi-FI', fil:'fil-PH', fr:'fr-FR',
    he:'he-IL', hi:'hi-IN', hr:'hr-HR', hu:'hu-HU', hy:'hy-AM', id:'id-ID',
    is:'is-IS', it:'it-IT', ja:'ja-JP', ka:'ka-GE', kk:'kk-KZ', km:'km-KH',
    ko:'ko-KR', lo:'lo-LA', lt:'lt-LT', lv:'lv-LV', mk:'mk-MK', ms:'ms-MY',
    nb:'nb-NO', ne:'ne-IN', nl:'nl-NL', pl:'pl-PL', ps:'ps-AF', pt:'pt-BR',
    ro:'ro-RO', ru:'ru-RU', si:'si-LK', sk:'sk-SK', sl:'sl-SI', sq:'sq-AL',
    sr:'sr-Latn-CS', sv:'sv-SE', sw:'sw-TZ', ta:'ta-IN', th:'th-TH', tr:'tr-TR',
    uk:'uk-UA', ur:'ur-PK', uz:'uz-Cyrl-UZ', vi:'vi-VN', xh:'xh-ZA', zh:'zh-CN',
    zu:'zu-ZA'
  };

  /* Normalize a tag to xx-YY (lowercase lang, uppercase region) */
  function normalize(tag) {
    var parts = tag.replace('_', '-').split('-');
    var lang = parts[0].toLowerCase();
    if (parts.length > 1) return lang + '-' + parts[1].toUpperCase();
    return lang;
  }

  function loadJson(loc, cb) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'locales-obj/' + loc + '.json', true);
      xhr.onloadend = function () {
        if (xhr.status === 200 && xhr.responseText) {
          try {
            var arr = JSON.parse(xhr.responseText);
            var map = {};
            for (var i = 0; i < arr.length; i++) map[arr[i].$i] = arr[i].$v;
            cb(map);
            return;
          } catch (e) {}
        }
        cb(null);
      };
      xhr.send();
    } catch (e) { cb(null); }
  }

  var L10n = {
    lang: 'en-US',
    _data: {},

    init: function (callback) {
      var raw  = (navigator.language || navigator.userLanguage || 'en-US');
      var norm = normalize(raw);
      var base = norm.split('-')[0];

      var self = this;
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        self._applyDir();
        callback && callback();
      }

      var timer = setTimeout(finish, 1500);

      /* Target locale: exact tag → base's default region → en-US */
      var target = 'en-US';
      if (DEFAULT_REGION[base]) target = DEFAULT_REGION[base];
      if (norm.indexOf('-') !== -1) target = norm; /* prefer exact tag if a file exists */

      /* Always load en-US as the per-key fallback base, then overlay target. */
      loadJson('en-US', function (enMap) {
        self._data = enMap || {};
        if (target === 'en-US') { clearTimeout(timer); finish(); return; }
        loadJson(target, function (locMap) {
          if (!locMap && target !== DEFAULT_REGION[base] && DEFAULT_REGION[base]) {
            /* exact tag missing — try base's default region */
            loadJson(DEFAULT_REGION[base], function (defMap) {
              if (defMap) { overlay(self._data, defMap); self.lang = DEFAULT_REGION[base]; }
              clearTimeout(timer); finish();
            });
            return;
          }
          if (locMap) { overlay(self._data, locMap); self.lang = target; }
          clearTimeout(timer); finish();
        });
      });

      function overlay(baseMap, over) {
        for (var k in over) if (over.hasOwnProperty(k)) baseMap[k] = over[k];
      }
    },

    get: function (key) {
      var val = this._data[key];
      return val !== undefined ? val : key;
    },

    _applyDir: function () {
      var base = this.lang.split('-')[0];
      var dir  = RTL_LANGS.indexOf(base) !== -1 ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir',  dir);
      document.documentElement.setAttribute('lang', this.lang);
    }
  };

  global.L10n = L10n;
}(this));
