(function (global) {
  'use strict';

  var RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'yi', 'ug', 'dv', 'ps', 'sd'];

  var L10n = {
    lang: 'en',
    _data: {},

    init: function () {
      var raw = (navigator.language || navigator.userLanguage || 'en');
      var lang = raw.toLowerCase().replace('_', '-');

      /* Try full tag, then base language */
      if (TRANSLATIONS[lang]) {
        this.lang = lang;
      } else {
        var base = lang.split('-')[0];
        this.lang = TRANSLATIONS[base] ? base : 'en';
      }

      this._data = TRANSLATIONS;
      this._applyDir();
    },

    get: function (key) {
      var bundle = this._data[this.lang];
      if (bundle && bundle[key] !== undefined) return bundle[key];
      /* Fallback to English */
      var en = this._data['en'];
      return (en && en[key] !== undefined) ? en[key] : key;
    },

    _applyDir: function () {
      var base = this.lang.split('-')[0];
      var dir = RTL_LANGS.indexOf(base) !== -1 ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', this.lang);
    }
  };

  global.L10n = L10n;
}(this));
