(function (global) {
  'use strict';

  var RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'yi', 'ug', 'dv', 'ps', 'sd'];

  var L10n = {
    lang: 'en',
    _data: {},

    init: function (callback) {
      var raw  = (navigator.language || navigator.userLanguage || 'en');
      var lang = raw.toLowerCase().replace('_', '-');
      var base = lang.split('-')[0];

      var self = this;
      var tried = [];
      if (lang !== base) tried.push(lang);
      tried.push(base);
      if (base !== 'en') tried.push('en');

      function tryNext() {
        if (!tried.length) { self._applyDir(); callback && callback(); return; }
        var loc = tried.shift();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/locales-obj/' + loc + '.json', true);
        xhr.onloadend = function () {
          if (xhr.status === 200 && xhr.responseText) {
            try {
              var arr  = JSON.parse(xhr.responseText);
              var map  = {};
              for (var i = 0; i < arr.length; i++) map[arr[i].$i] = arr[i].$v;
              self._data = map;
              self.lang  = loc;
              self._applyDir();
              callback && callback();
              return;
            } catch (e) {}
          }
          tryNext();
        };
        xhr.send();
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
