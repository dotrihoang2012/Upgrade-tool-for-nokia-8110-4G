(function (global) {
  'use strict';

  var RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'yi', 'ug', 'dv', 'ps', 'sd'];

  /* Default region per base language — maps "en" → "en-US.json" etc. */
  var DEFAULT_REGION = {
    en: 'en-US', vi: 'vi-VN', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR',
    de: 'de-DE', it: 'it-IT', ar: 'ar-SA', zh: 'zh-CN', ru: 'ru-RU',
    hi: 'hi-IN', id: 'id-ID', tr: 'tr-TR', pl: 'pl-PL', nl: 'nl-NL',
    sw: 'sw-TZ', ms: 'ms-MY', bn: 'bn-BD', ur: 'ur-PK', fa: 'fa-IR',
    ko: 'ko-KR', ja: 'ja-JP', th: 'th-TH'
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
