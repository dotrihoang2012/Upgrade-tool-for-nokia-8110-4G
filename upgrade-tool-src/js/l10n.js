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

      var timer = setTimeout(finish, 1000);

      /* Candidates: exact tag → base's default region → en-US */
      var tried = [];
      if (norm.indexOf('-') !== -1) tried.push(norm);
      if (DEFAULT_REGION[base] && tried.indexOf(DEFAULT_REGION[base]) === -1) {
        tried.push(DEFAULT_REGION[base]);
      }
      if (tried.indexOf('en-US') === -1) tried.push('en-US');

      function tryNext() {
        if (!tried.length) { clearTimeout(timer); finish(); return; }
        var loc = tried.shift();
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', 'locales-obj/' + loc + '.json', true);
          xhr.onloadend = function () {
            if (xhr.status === 200 && xhr.responseText) {
              try {
                var arr = JSON.parse(xhr.responseText);
                var map = {};
                for (var i = 0; i < arr.length; i++) map[arr[i].$i] = arr[i].$v;
                self._data = map;
                self.lang  = loc;
                clearTimeout(timer);
                finish();
                return;
              } catch (e) {}
            }
            tryNext();
          };
          xhr.send();
        } catch (e) { tryNext(); }
      }

      tryNext();
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
