(function () {
  'use strict';

  /* XPCOM constants — avoid using Cr (unavailable at privileged level) */
  var NS_OK               = 0;
  var NS_BINDING_ABORTED  = 0x804b0002;
  var NS_ERROR_NO_INTERFACE = 0x80004002;

  var _Cc = null, _Ci = null, _Cr = null;
  var _IOSvc = null, _SISCtor = null, _CertOvCtor = null, _ProcCtor = null, _LFCtor = null, _FOSCtor2 = null;
  try {
    if (typeof Components !== 'undefined') {
      _Cc = Components.classes;
      _Ci = Components.interfaces;
      _Cr = Components.results;
    }
  } catch (e) { console.error('[init] Components error:', e.message); }

  /* Diagnostic — runs synchronously at script load */
  try {
    console.log('[xpcom] Components=' + typeof Components +
      ' Ctor=' + (typeof Components !== 'undefined' ? typeof Components.Constructor : 'n/a') +
      ' Cc=' + (typeof Components !== 'undefined' ? typeof Components.classes : 'n/a'));
  } catch(eDiag) {}

  /* Components.Constructor works even when Cc/Cu are unavailable */
  if (typeof Components !== 'undefined' && Components.Constructor) {
    try {
      var _IOSvcCtor = Components.Constructor(
        '@mozilla.org/network/io-service;1', 'nsIIOService');
      _IOSvc = new _IOSvcCtor();
      console.log('[init] IOSvc truthy=' + !!_IOSvc + ' type=' + typeof _IOSvc);
    } catch (e) { console.warn('[init] IOSvc:', e.message); }

    try {
      _SISCtor = Components.Constructor(
        '@mozilla.org/scriptableinputstream;1',
        'nsIScriptableInputStream', 'init');
      console.log('[init] SISCtor truthy=' + !!_SISCtor + ' type=' + typeof _SISCtor);
    } catch (e) { console.warn('[init] SISCtor:', e.message); }

    try {
      _CertOvCtor = Components.Constructor(
        '@mozilla.org/security/certoverride;1', 'nsICertOverrideService');
      console.log('[init] CertOvCtor truthy=' + !!_CertOvCtor);
    } catch (e) { console.warn('[init] CertOvCtor:', e.message); }

    try {
      _ProcCtor = Components.Constructor('@mozilla.org/process/util;1', 'nsIProcess');
      console.log('[init] ProcCtor ok');
    } catch (e) { console.warn('[init] ProcCtor:', e.message); }

    try {
      _LFCtor   = Components.Constructor('@mozilla.org/file/local;1', 'nsILocalFile', 'initWithPath');
      _FOSCtor2 = Components.Constructor('@mozilla.org/network/file-output-stream;1', 'nsIFileOutputStream', 'init');
      console.log('[init] LFCtor=' + !!_LFCtor + ' FOSCtor2=' + !!_FOSCtor2);
    } catch (e) { console.warn('[init] file ctors:', e.message); }

    /* INLINE cert_override.txt write — must be at top-level IIFE, not in a function */
    try {
      var _LFCtor  = Components.Constructor('@mozilla.org/file/local;1', 'nsILocalFile', 'initWithPath');
      var _FISCtor2 = Components.Constructor('@mozilla.org/network/file-input-stream;1', 'nsIFileInputStream', 'init');
      var _FOSCtor2 = Components.Constructor('@mozilla.org/network/file-output-stream;1', 'nsIFileOutputStream', 'init');
      var _SIS2Ctor = Components.Constructor('@mozilla.org/scriptableinputstream;1', 'nsIScriptableInputStream', 'init');

      var _mozDir = new _LFCtor('/data/b2g/mozilla');
      console.log('[cert] mozDir truthy=' + !!_mozDir + ' type=' + typeof _mozDir);

      if (_mozDir && _mozDir.exists && _mozDir.exists() && _mozDir.isDirectory()) {
        var _profDir = null, _entries = _mozDir.directoryEntries;
        while (_entries.hasMoreElements()) {
          var _e = _entries.getNext().QueryInterface(Components.interfaces.nsIFile);
          if (_e.isDirectory() && /\.default$/.test(_e.leafName)) { _profDir = _e; break; }
        }
        if (_profDir) {
          var _HOST = 'release-assets.githubusercontent.com';
          var _FP   = 'EA:69:BC:71:1C:B9:D4:56:98:D2:FD:AA:48:54:D7:DC:08:6A:CD:3A:9C:35:01:64:90:9B:68:8A:C7:C0:63:1F';
          var _LINE = _HOST + ':443\tOID.2.16.840.1.101.3.4.2.1\t' + _FP + '\tUM\t\n';
          var _certF = new _LFCtor(_profDir.path + '/cert_override.txt');
          var _exist = '';
          if (_certF.exists()) {
            try {
              var _fin = new _FISCtor2(_certF, 0x01, 0, 0);
              var _sis = new _SIS2Ctor(_fin);
              _exist = _sis.read(_sis.available());
              _fin.close();
            } catch(er2) {}
          }
          if (_exist.indexOf(_HOST + ':443') === -1) {
            if (_exist && _exist[_exist.length - 1] !== '\n') _exist += '\n';
            var _hdr = '# PSM Certificate Override Settings file\n# This is a generated file!  Do not edit.\n';
            var _cont = (_exist || _hdr) + _LINE;
            var _fos = new _FOSCtor2(_certF, 0x02 | 0x08 | 0x20, 420, 0);
            _fos.write(_cont, _cont.length);
            _fos.close();
            console.log('[cert] cert_override.txt written: ' + _profDir.path);
          } else {
            console.log('[cert] override already present');
          }
        } else {
          console.warn('[cert] no *.default profile found');
        }
      } else {
        console.warn('[cert] /data/b2g/mozilla not found or not dir');
      }
    } catch (eCW) { console.warn('[cert] inline cert write failed: ' + eCW.message); }
  }

  var _hasXPCOM   = !!(_Cc && _Ci && _Cr);
  var _hasCuXPCOM = !!(_IOSvc && _SISCtor);
  console.log('[init] _hasXPCOM=' + _hasXPCOM + ' _hasCuXPCOM=' + _hasCuXPCOM +
    ' _Ci=' + !!_Ci + ' IOSvc_bool=' + !!_IOSvc + ' SIS_bool=' + !!_SISCtor);

  var CHANNEL = {
    stable: {
      url:      'https://github.com/dotrihoang2012/KaiOS-2.5.4-in-nokia-8110-4G/releases/download/Stable/KaiOS_2.5.4_Stable_v2-signed.zip',
      filename: 'KaiOS_2.5.4_Stable_v2-signed.zip',
      label:    'Stable'
    },
    canary: {
      url:      'https://github.com/dotrihoang2012/KaiOS-2.5.4-in-nokia-8110-4G/releases/download/Canary/KaiOS-2.5.4-v6-signed.zip',
      filename: 'KaiOS-2.5.4-v6-signed.zip',
      label:    'Canary'
    }
  };

  var MIN_SPACE = 200 * 1024 * 1024; // 200 MB

  var state = { screen: 'init', channel: null, focus: 0, xhr: null, cdnHost: '', cdnUrl: '',
                targetStorage: null, storageIsExternal: false };

  /* Returns the download target storage — external SD if detected, else internal */
  function getTargetStorage() {
    return state.targetStorage || navigator.getDeviceStorage('sdcard');
  }
  var _certAttempted = false;
  var _certFixAttempted = false;
  var $content, $title, $skL, $skC, $skR;

  /* ── Write cert_override.txt at boot (sync XPCOM context) ── */
  function writeCertOverride() {
    console.log('[cert] wCO entry Components=' + typeof Components);
    if (typeof Components === 'undefined') return;
    try {
      var _Cc2 = null, _Ci2 = null;
      try { _Cc2 = Components.classes; _Ci2 = Components.interfaces; } catch(e0) {}
      console.log('[cert] wCO Cc=' + !!_Cc2 + ' Ci=' + !!_Ci2 + ' Ctor=' + !!Components.Constructor);

      var LocalFileCtor = Components.Constructor(
        '@mozilla.org/file/local;1', 'nsILocalFile', 'initWithPath');
      var FISCtor = Components.Constructor(
        '@mozilla.org/network/file-input-stream;1', 'nsIFileInputStream', 'init');
      var FOSCtor = Components.Constructor(
        '@mozilla.org/network/file-output-stream;1', 'nsIFileOutputStream', 'init');
      var SISCtor2 = Components.Constructor(
        '@mozilla.org/scriptableinputstream;1', 'nsIScriptableInputStream', 'init');

      var mozDir = new LocalFileCtor('/data/b2g/mozilla');
      console.log('[cert] mozDir type=' + typeof mozDir + ' truthy=' + !!mozDir);
      if (!mozDir || !mozDir.exists() || !mozDir.isDirectory()) {
        console.warn('[cert] /data/b2g/mozilla not found');
        return;
      }

      var profileDir = null;
      var entries = mozDir.directoryEntries;
      while (entries.hasMoreElements()) {
        var entry = entries.getNext().QueryInterface(Components.interfaces.nsIFile);
        if (entry.isDirectory() && /\.default$/.test(entry.leafName)) {
          profileDir = entry;
          break;
        }
      }
      if (!profileDir) { console.warn('[cert] no *.default profile'); return; }

      var HOST = 'release-assets.githubusercontent.com';
      var FP   = 'EA:69:BC:71:1C:B9:D4:56:98:D2:FD:AA:48:54:D7:DC:08:6A:CD:3A:9C:35:01:64:90:9B:68:8A:C7:C0:63:1F';
      var LINE = HOST + ':443\tOID.2.16.840.1.101.3.4.2.1\t' + FP + '\tU\t\n';

      var certFile = new LocalFileCtor(profileDir.path + '/cert_override.txt');
      var existing = '';
      if (certFile.exists()) {
        try {
          var fin = new FISCtor(certFile, 0x01, 0, 0);
          var sis = new SISCtor2(fin);
          existing = sis.read(sis.available());
          fin.close();
        } catch (er) { console.warn('[cert] read cert_override:', er.message); }
      }

      if (existing.indexOf(HOST + ':443') !== -1) {
        console.log('[cert] override already present');
        return;
      }

      var header = '# PSM Certificate Override Settings file\n# This is a generated file!  Do not edit.\n';
      if (existing && existing[existing.length - 1] !== '\n') existing += '\n';
      var content = (existing || header) + LINE;
      var fos = new FOSCtor(certFile, 0x02 | 0x08 | 0x20, 420, 0);
      fos.write(content, content.length);
      fos.close();
      console.log('[cert] cert_override.txt written at ' + profileDir.path);
    } catch (e) {
      console.warn('[cert] writeCertOverride failed: ' + e.message);
    }
  }

  /* ── Boot ── */
  function boot() {
    L10n.init(function () {
      $content = document.getElementById('content');
      $title   = document.getElementById('header-title');
      $skL     = document.getElementById('sk-left');
      $skC     = document.getElementById('sk-center');
      $skR     = document.getElementById('sk-right');
      document.addEventListener('keydown', onKey);
      checkDevice();
    });
  }

  /* ── Device detection ── */
  function checkDevice() {
    if (!navigator.mozSettings) { checkSDCard('welcome'); return; }
    var lock = navigator.mozSettings.createLock();
    var reqModel = lock.get('deviceinfo.product_model');
    var reqOs    = lock.get('deviceinfo.os');
    var model = '', osVer = '', pending = 2;
    function onDone() {
      if (--pending > 0) return;
      var ua = navigator.userAgent || '';
      var is8110 = model.indexOf('8110') !== -1 || ua.indexOf('8110') !== -1;
      if (!is8110) showScreen('wrong_device', {});
      else checkSDCard('welcome');
    }
    reqModel.onsuccess = function () { model = reqModel.result['deviceinfo.product_model'] || ''; onDone(); };
    reqModel.onerror   = function () { onDone(); };
    reqOs.onsuccess    = function () { osVer = reqOs.result['deviceinfo.os'] || ''; onDone(); };
    reqOs.onerror      = function () { onDone(); };
  }

  /* ── SD card startup check — requires external microSD ── */
  function checkSDCard(nextScreen) {
    if (!navigator.getDeviceStorage) { showScreen('no_sdcard'); return; }

    /* Collect non-default storage entries (candidates for external SD) */
    var candidates = [];
    try {
      if (navigator.getDeviceStorages) {
        var allSD = navigator.getDeviceStorages('sdcard');
        for (var i = 0; i < allSD.length; i++) {
          if (allSD[i]['default'] === false) candidates.push(allSD[i]);
        }
        if (!candidates.length && allSD.length > 1) {
          for (var j = 1; j < allSD.length; j++) candidates.push(allSD[j]);
        }
      }
    } catch (e) { /* getDeviceStorages unavailable */ }

    if (!candidates.length) { showScreen('no_sdcard'); return; }

    verifyExternalSD(candidates[candidates.length - 1], nextScreen);
  }

  /* Verify physical SD card is present by checking for Android-created folders.
     When a card is inserted KaiOS creates DCIM, Pictures, Movies, etc.
     If none have files, fall back to freeSpace() > 0 (empty but real card). */
  function verifyExternalSD(storage, nextScreen) {
    var FOLDERS = ['DCIM', 'Pictures', 'Movies', 'Videos', 'Music', 'Downloads'];
    var pending = FOLDERS.length;
    var confirmed = false;

    function onResult(hasFile) {
      if (confirmed) return;
      if (hasFile) {
        confirmed = true;
        state.targetStorage     = storage;
        state.storageIsExternal = true;
        console.log('[sd] external SD confirmed via folder content');
        showScreen(nextScreen || 'welcome');
        return;
      }
      if (--pending > 0) return;
      /* All folders empty — check if the storage has any capacity at all */
      var r = storage.freeSpace();
      r.onsuccess = function () {
        if (r.result > 0) {
          state.targetStorage     = storage;
          state.storageIsExternal = true;
          console.log('[sd] external SD confirmed via freeSpace=' + r.result);
          showScreen(nextScreen || 'welcome');
        } else {
          console.log('[sd] no physical SD card detected');
          showScreen('no_sdcard');
        }
      };
      r.onerror = function () { showScreen('no_sdcard'); };
    }

    FOLDERS.forEach(function (folder) {
      var cur = storage.enumerate(folder);
      cur.onsuccess = function () { onResult(!!cur.result); };
      cur.onerror   = function () { onResult(false); };
    });
  }

  /* ── Screen router ── */
  var TRANS_MS = 100;

  function showScreen(name, opts, dir) {
    if (name === 'select_channel') { _certAttempted = false; _certFixAttempted = false; }
    state.screen = name;
    state.focus  = 0;

    var fn = SCREENS[name];
    if (!fn) return;
    var newEl = fn(opts || {});
    newEl.classList.add('screen');

    var noHeader = (name === 'welcome' || name === 'no_sdcard' || name === 'sdcard_full' || name === 'ssl_cert_error' || name === 'wrong_device');
    var $hdr = document.getElementById('header');
    var $cnt = document.getElementById('content');
    $hdr.style.display = noHeader ? 'none' : '';
    $cnt.style.top     = noHeader ? '0'    : '';

    var oldEl = $cnt.querySelector('.screen');
    if (oldEl && dir) {
      newEl.classList.add(dir === 'forward' ? 'slide-enter-fwd' : 'slide-enter-back');
      oldEl.classList.add(dir === 'forward' ? 'slide-exit-fwd'  : 'slide-exit-back');
      $cnt.appendChild(newEl);
      var _old = oldEl;
      setTimeout(function () {
        if (_old.parentNode) _old.parentNode.removeChild(_old);
      }, TRANS_MS + 20);
    } else {
      $cnt.innerHTML = '';
      $cnt.appendChild(newEl);
    }

    setSoftkeys(name);
    setTitle(name);

    setTimeout(function () {
      var fills = $cnt.querySelectorAll('.prog-indeterminate .prog-fill');
      for (var i = 0; i < fills.length; i++) startIndeterminate(fills[i]);
    }, 0);
  }

  function startIndeterminate(el) {
    function step(name, easing) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = name + ' 1.52s ' + easing + ' forwards';
      el.addEventListener('animationend', function done() {
        el.removeEventListener('animationend', done);
        var track = el.parentNode;
        if (!track || !track.classList.contains('prog-indeterminate')) return;
        if (name === 'kaiMovingIn') step('kaiMovingOut', 'cubic-bezier(0.6,0,0.3,1)');
        else                        step('kaiMovingIn',  'cubic-bezier(0.3,0,0.4,1)');
      });
    }
    step('kaiMovingIn', 'cubic-bezier(0.3,0,0.4,1)');
  }

  function setTitle(name) {
    var map = {
      welcome:          'Upgrade Tool',
      no_sdcard:        'Upgrade Tool',
      sdcard_full:      'Upgrade Tool',
      select_channel:   L10n.get('select_channel'),
      downloading:      L10n.get('downloading').replace('...','').trim(),
      copying:          L10n.get('copying').replace('...','').trim(),
      creating_command: 'Install File',
      warning:          L10n.get('warning_title'),
      manual_restart:   L10n.get('manual_title'),
      ssl_cert_error:   L10n.get('error'),
      error_screen:     L10n.get('error'),
      wrong_device:     'Upgrade Tool',
      cancel_confirm:   L10n.get('cancel'),
      adb_ready:        'ADB Required'
    };
    $title.textContent = map[name] || 'Upgrade Tool';
  }

  function setSoftkeys(name) {
    var map = {
      welcome:          ['', L10n.get('ok'),     ''],
      no_sdcard:        ['', '',                 L10n.get('exit')],
      sdcard_full:      ['', '',                 L10n.get('exit')],
      select_channel:   ['', L10n.get('select'), ''],
      downloading:      ['', '',                 L10n.get('cancel')],
      copying:          ['', '',                 ''],
      creating_command: ['', '',                 L10n.get('cancel')],
      warning:          [L10n.get('no'), L10n.get('yes'), L10n.get('cancel')],
      manual_restart:   ['',            '',              L10n.get('close')],
      ssl_cert_error:   ['',            'Browser',       L10n.get('cancel')],
      error_screen:     ['',            '',              L10n.get('exit')],
      wrong_device:     ['',            '',              L10n.get('exit')],
      cancel_confirm:   [L10n.get('no'), L10n.get('yes'), ''],
      adb_ready:        ['',            L10n.get('ok'),  '']
    };
    var sk = map[name] || ['', '', ''];
    $skL.textContent = sk[0];
    $skC.textContent = sk[1];
    $skR.textContent = sk[2];
  }

  /* ── Keys ── */
  function onKey(e) {
    switch (e.key) {
      case 'Enter': case 'Accept':     e.preventDefault(); onOK();       break;
      case 'ArrowUp':                  e.preventDefault(); moveFocus(-1); break;
      case 'ArrowDown':                e.preventDefault(); moveFocus(1);  break;
      case 'SoftLeft':  case 'F1':     e.preventDefault(); onSoftLeft();  break;
      case 'SoftRight': case 'F2':     e.preventDefault(); onSoftRight(); break;
      case 'Backspace': case 'GoBack': e.preventDefault(); onBack();      break;
    }
  }

  function moveFocus(d) {
    var items = $content.querySelectorAll('.list-item');
    if (!items.length) return;
    items[state.focus].classList.remove('focused');
    state.focus = (state.focus + d + items.length) % items.length;
    var next = items[state.focus];
    next.classList.add('focused');
    try { next.scrollIntoView({ block: 'nearest' }); } catch(e) { next.scrollIntoView(false); }
  }

  function onOK() {
    switch (state.screen) {

      case 'welcome':
        var s = getTargetStorage();
        var r = s.freeSpace();
        r.onsuccess = function () {
          if (r.result < MIN_SPACE) showScreen('sdcard_full', { free: r.result }, 'forward');
          else showScreen('select_channel', {}, 'forward');
        };
        r.onerror = function () { showScreen('select_channel', {}, 'forward'); };
        break;

      case 'select_channel':
        state.channel = state.focus === 0 ? 'stable' : 'canary';
        startDownload();
        break;

      case 'ssl_cert_error':
        try {
          new MozActivity({ name: 'view',
            data: { type: 'url', url: state.cdnHost || 'https://release-assets.githubusercontent.com' }
          });
        } catch (e) { console.warn('MozActivity:', e); }
        break;

      case 'warning':
        bootToRecovery();
        break;

      case 'cancel_confirm':
        cancelInstall();
        break;

      case 'adb_ready':
        showScreen('warning', {}, 'forward');
        break;
    }
  }

  function onSoftLeft() {
    switch (state.screen) {
      case 'warning':       showScreen('manual_restart', {}, 'forward'); break;
      case 'cancel_confirm': showScreen('warning', {}, 'back'); break;
    }
  }

  function onSoftRight() {
    switch (state.screen) {
      case 'no_sdcard': case 'sdcard_full':
      case 'error_screen': case 'wrong_device':
        window.close(); break;
      case 'ssl_cert_error':
        try {
          new MozActivity({ name: 'view',
            data: { type: 'url', url: state.cdnHost || 'https://release-assets.githubusercontent.com' }
          });
        } catch (e) { console.warn('MozActivity:', e); }
        break;
      case 'downloading':
        cancelDownload(); break;
      case 'creating_command':
        cancelInstall(); break;
      case 'warning':
        showScreen('cancel_confirm', {}, 'forward'); break;
      case 'manual_restart':
        window.close(); break;
    }
  }

  function onBack() {
    switch (state.screen) {
      case 'welcome':
      case 'no_sdcard':
      case 'sdcard_full':
      case 'wrong_device':
        window.close(); break;
      case 'select_channel':
        showScreen('welcome', {}, 'back'); break;
      case 'ssl_cert_error':
        _certAttempted = false;
        showScreen('select_channel', {}, 'back'); break;
      case 'error_screen':
        showScreen('select_channel', {}, 'back'); break;
      case 'cancel_confirm':
        showScreen('warning', {}, 'back'); break;
    }
  }

  var DL_CHUNK = 20 * 1024 * 1024; /* 20 MB per chunk — keeps peak RAM under 25 MB */

  /* ── Download ── */
  function startDownload() {
    var info = CHANNEL[state.channel];
    console.log('[dl] start channel=' + state.channel);
    showScreen('downloading', { label: info.label }, 'forward');

    /* Storage already detected in checkSDCard — external SD required */
    console.log('[dl] storageIsExternal=' + state.storageIsExternal);

    /* HEAD first to get Content-Length for chunked mode */
    var head = new XMLHttpRequest({ mozSystem: true });
    state.xhr = head;
    head.open('HEAD', info.url, true);
    head.timeout = 15000;
    head.onloadend = function () {
      if (state.xhr !== head) return;
      var cl    = head.getResponseHeader('Content-Length');
      var total = cl ? parseInt(cl, 10) : 0;
      console.log('[dl] HEAD status=' + head.status + ' Content-Length=' + total);
      if (total > DL_CHUNK) {
        /* Delete stale zip before first chunk so addNamed doesn't fail */
        var preDel = getTargetStorage().delete(info.filename);
        preDel.onsuccess = preDel.onerror = function () {
          console.log('[dl] pre-delete done, starting chunks');
          downloadChunk(info.url, info.filename, total, 0);
        };
      } else {
        downloadDirect(info.url, info.filename);
      }
    };
    head.onerror = head.ontimeout = function () {
      if (state.xhr !== head) return;
      console.log('[dl] HEAD failed, fallback to direct');
      downloadDirect(info.url, info.filename);
    };
    head.send();
  }

  /* Chunked download — 20 MB at a time, written straight to SD card */
  function downloadChunk(url, filename, total, offset) {
    var end = Math.min(offset + DL_CHUNK - 1, total - 1);
    console.log('[dl] chunk ' + offset + '-' + end + ' / ' + total);
    var xhr = new XMLHttpRequest({ mozSystem: true });
    state.xhr = xhr;
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Range', 'bytes=' + offset + '-' + end);
    xhr.responseType = 'blob';

    xhr.onprogress = function (e) {
      if (state.xhr !== xhr) return;
      updateDlProgress(offset + e.loaded, total);
    };

    xhr.onloadend = function () {
      if (state.xhr !== xhr) return;
      if ((xhr.status === 206 || xhr.status === 200) && xhr.response && xhr.response.size > 0) {
        var received = offset + xhr.response.size;
        var storage  = getTargetStorage();
        var req = offset === 0
          ? storage.addNamed(xhr.response, filename)
          : storage.appendNamed(xhr.response, filename);
        req.onsuccess = function () {
          updateDlProgress(received, total);
          if (received >= total) {
            state.xhr = null;
            createCommandFile(filename);
          } else {
            downloadChunk(url, filename, total, received);
          }
        };
        req.onerror = function () {
          state.xhr = null;
          showError(L10n.get('err_copy'));
        };
      } else {
        state.xhr = null;
        tryLocalFile();
      }
    };

    xhr.send();
  }

  /* Fallback: single-blob download (small files or HEAD not supported) */
  function downloadDirect(url, filename) {
    var xhr = new XMLHttpRequest({ mozSystem: true });
    state.xhr = xhr;
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onprogress = function (e) {
      if (state.xhr !== xhr) return;
      updateDlProgress(e.loaded, e.lengthComputable ? e.total : 0);
    };
    xhr.onloadend = function () {
      if (state.xhr !== xhr) return;
      state.xhr = null;
      if (xhr.status === 200 && xhr.response && xhr.response.size > 0) {
        copyToSD(xhr.response);
      } else {
        tryLocalFile();
      }
    };
    xhr.send();
  }

  /* XPCOM objects become falsy in async XHR callbacks — cert override is
     written to cert_override.txt at boot() instead. Fall to local file. */
  function tryCertFix(xhr) {
    console.log('[cert] tryCertFix: falling back to local file check');
    tryLocalFile();
  }

  /* Check if the update zip already exists on SD card.
     Allows user to copy the file manually when download fails. */
  function tryLocalFile() {
    var filename = CHANNEL[state.channel].filename;
    console.log('[dl] tryLocalFile: checking sdcard for ' + filename);
    var storage = getTargetStorage();
    var req = storage.get(filename);
    req.onsuccess = function () {
      var f = req.result;
      console.log('[dl] found on sdcard root size=' + (f ? f.size : 'null'));
      if (f && f.size > 1024 * 1024) {
        createCommandFile(filename);
      } else {
        checkDownloadDir();
      }
    };
    req.onerror = function () {
      console.log('[dl] not on sdcard root: ' + req.error.name);
      checkDownloadDir();
    };
    function checkDownloadDir() {
      var req2 = storage.get('download/' + filename);
      req2.onsuccess = function () {
        var f2 = req2.result;
        console.log('[dl] found in download/ size=' + (f2 ? f2.size : 'null'));
        if (f2 && f2.size > 1024 * 1024) {
          copyToSD(f2);
        } else {
          handleSslError();
        }
      };
      req2.onerror = function () {
        console.log('[dl] not in download/: ' + req2.error.name);
        handleSslError();
      };
    }
  }

  function handleSslError() {
    if (!_certAttempted) {
      _certAttempted = true;
      showScreen('ssl_cert_error', {}, 'forward');
      setTimeout(openBrowserForCert, 600);
    } else {
      showError(L10n.get('err_download'));
    }
  }

  function openBrowserForCert() {
    /* Use full CDN URL (with token) so browser encounters the actual cert and prompts exception */
    var url = state.cdnUrl || state.cdnHost || 'https://release-assets.githubusercontent.com';
    console.log('[cert] opening browser url=' + url.slice(0, 80));
    try {
      var act = new MozActivity({ name: 'view', data: { type: 'url', url: url } });
      act.onsuccess = act.onerror = function () {
        console.log('[cert] returned from browser, checking sdcard');
        if (state.screen === 'ssl_cert_error') tryLocalFile();
      };
    } catch (e) {
      console.warn('[cert] MozActivity failed:', e.message);
    }
  }

  function updateDlProgress(loaded, total) {
    var track = document.getElementById('prog-track');
    var fill  = document.getElementById('prog-fill');
    var pctEl = document.getElementById('prog-pct');
    var szEl  = document.getElementById('prog-size');
    if (!fill) return;
    if (total > 0) {
      if (track && track.classList.contains('prog-indeterminate')) {
        track.classList.remove('prog-indeterminate');
        fill.style.animation = 'none';
        fill.style.left  = '0';
        fill.style.width = '0%';
      }
      var pct = loaded / total * 100;
      fill.style.width = pct.toFixed(1) + '%';
      if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';
      if (szEl)  szEl.textContent  = fmtBytes(loaded) + ' / ' + fmtBytes(total);
    } else {
      if (szEl) szEl.textContent = fmtBytes(loaded);
    }
  }

  /* XPCOM direct download — uses nsIIOService channel so we can attach
     nsIBadCertListener2 to bypass SEC_ERROR_UNKNOWN_ISSUER on CDN.
     Called only when _hasXPCOM is true (refs cached at init time).   */
  function directDownload(cdnUrl) {
    console.log('[xpcom] directDownload url=' + cdnUrl);
    try {
      var filename = CHANNEL[state.channel].filename;
      var filePath = '/storage/sdcard/' + filename;

      var outFile = _Cc['@mozilla.org/file/local;1'].createInstance(_Ci.nsILocalFile);
      outFile.initWithPath(filePath);
      if (outFile.exists()) outFile.remove(false);

      var fileOut = _Cc['@mozilla.org/network/file-output-stream;1']
                      .createInstance(_Ci.nsIFileOutputStream);
      fileOut.init(outFile, 0x02 | 0x08 | 0x20, parseInt('0644', 8), 0);

      var binOut = _Cc['@mozilla.org/binaryoutputstream;1']
                     .createInstance(_Ci.nsIBinaryOutputStream);
      binOut.setOutputStream(fileOut);

      var binIn = _Cc['@mozilla.org/binaryinputstream;1']
                    .createInstance(_Ci.nsIBinaryInputStream);

      var ioSvc = _Cc['@mozilla.org/network/io-service;1'].getService(_Ci.nsIIOService);
      var netChannel = ioSvc.newChannelFromURI(ioSvc.newURI(cdnUrl, null, null));

      try {
        netChannel.owner = _Cc['@mozilla.org/scriptsecuritymanager;1']
                             .getService(_Ci.nsIScriptSecurityManager)
                             .getSystemPrincipal();
      } catch (e) {}

      state.xhr = { abort: function () {
        try { netChannel.cancel(_Cr.NS_BINDING_ABORTED); } catch (e) {}
      }};

      netChannel.notificationCallbacks = {
        QueryInterface: function (iid) {
          if (iid.equals(_Ci.nsIBadCertListener2) || iid.equals(_Ci.nsIProgressEventSink) ||
              iid.equals(_Ci.nsIInterfaceRequestor) || iid.equals(_Ci.nsISupports)) return this;
          throw _Cr.NS_ERROR_NO_INTERFACE;
        },
        getInterface: function (iid) {
          if (iid.equals(_Ci.nsIBadCertListener2)) return this;
          if (iid.equals(_Ci.nsIProgressEventSink)) return this;
          throw _Cr.NS_ERROR_NO_INTERFACE;
        },
        notifyCertProblem: function () { return true; },
        onProgress: function (req, ctx, progress, total) {
          updateDlProgress(progress, total);
        },
        onStatus: function () {}
      };

      netChannel.asyncOpen({
        QueryInterface: function (iid) {
          if (iid.equals(_Ci.nsIStreamListener) || iid.equals(_Ci.nsIRequestObserver) ||
              iid.equals(_Ci.nsISupports)) return this;
          throw _Cr.NS_ERROR_NO_INTERFACE;
        },
        onStartRequest: function () {},
        onDataAvailable: function (req, ctx, stream, offset, count) {
          binIn.setInputStream(stream);
          binOut.writeBytes(binIn.readBytes(count), count);
        },
        onStopRequest: function (req, ctx, status) {
          console.log('[xpcom] onStopRequest status=0x' + status.toString(16));
          state.xhr = null;
          try { binOut.close(); } catch (e) {}
          try { fileOut.close(); } catch (e) {}
          if (status === 0 || status === _Cr.NS_OK) {
            createCommandFile(filename);
          } else {
            showError(L10n.get('err_download') + ' [0x' + status.toString(16) + ']');
          }
        }
      }, null);

    } catch (e) {
      console.error('[xpcom] directDownload exception:', e.message);
      state.xhr = null;
      showError(L10n.get('err_download') + ' [' + e.message + ']');
    }
  }

  /* XPCOM download via nsIIOService channel — bypasses SSL cert errors via
     nsIBadCertListener2.notifyCertProblem. Collects stream chunks as Uint8Array
     (binary-safe) into Blob → copyToSD.                                        */
  function directDownloadViaCu(cdnUrl) {
    console.log('[cu] directDownloadViaCu url=' + cdnUrl.slice(0, 80));

    /* Components.classes may be null at eval-time but accessible in XHR callbacks */
    var Ci = null, Cc = null;
    try { if (typeof Components !== 'undefined') { Ci = Components.interfaces; Cc = Components.classes; } } catch (eCI) {}
    console.log('[cu] Cc=' + !!Cc + ' Ci=' + !!Ci);
    if (!Ci) { console.warn('[cu] no Ci'); tryLocalFile(); return; }

    try {
      var filename = CHANNEL[state.channel].filename;

      /* Try to get nsIIOService: getService (singleton) preferred over createInstance */
      var ioSvc = null;
      if (Cc) {
        try {
          ioSvc = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
          console.log('[cu] ioSvc via Cc ok');
        } catch (eCC) { console.warn('[cu] Cc ioSvc failed: ' + eCC.message); }
      }
      if (!ioSvc) {
        try {
          var IOSvcCtor = Components.Constructor('@mozilla.org/network/io-service;1', 'nsIIOService');
          ioSvc = new IOSvcCtor();
          console.log('[cu] ioSvc via Ctor, truthy=' + !!ioSvc);
        } catch (eCtor) { console.warn('[cu] Ctor ioSvc failed: ' + eCtor.message); }
      }
      if (!ioSvc) { console.warn('[cu] no ioSvc'); tryLocalFile(); return; }

      var netChannel;
      try {
        netChannel = ioSvc.newChannel(cdnUrl, null, null);
        console.log('[cu] newChannel ok');
      } catch (e1) {
        try {
          var uri = ioSvc.newURI(cdnUrl, null, null);
          netChannel = ioSvc.newChannelFromURI(uri);
          console.log('[cu] newChannelFromURI ok');
        } catch (e2) {
          throw new Error('channel: ' + e1.message + '; ' + e2.message);
        }
      }

      var chunks = [];
      var loadedBytes = 0;

      state.xhr = { abort: function () {
        try { netChannel.cancel(NS_BINDING_ABORTED); } catch (e) {}
      }};

      netChannel.notificationCallbacks = {
        QueryInterface: function (iid) {
          if (Ci.nsIBadCertListener2 && iid.equals(Ci.nsIBadCertListener2)) return this;
          if (Ci.nsIProgressEventSink && iid.equals(Ci.nsIProgressEventSink)) return this;
          if (Ci.nsIInterfaceRequestor && iid.equals(Ci.nsIInterfaceRequestor)) return this;
          if (Ci.nsISupports && iid.equals(Ci.nsISupports)) return this;
          throw NS_ERROR_NO_INTERFACE;
        },
        getInterface: function (iid) {
          if (Ci.nsIBadCertListener2 && iid.equals(Ci.nsIBadCertListener2)) return this;
          if (Ci.nsIProgressEventSink && iid.equals(Ci.nsIProgressEventSink)) return this;
          throw NS_ERROR_NO_INTERFACE;
        },
        notifyCertProblem: function () { return true; },
        onProgress: function (req, ctx, progress, total) {
          if (total > 0) updateDlProgress(progress, total);
        },
        onStatus: function () {}
      };

      netChannel.asyncOpen({
        QueryInterface: function (iid) {
          if (Ci.nsIStreamListener && iid.equals(Ci.nsIStreamListener)) return this;
          if (Ci.nsIRequestObserver && iid.equals(Ci.nsIRequestObserver)) return this;
          if (Ci.nsISupports && iid.equals(Ci.nsISupports)) return this;
          throw NS_ERROR_NO_INTERFACE;
        },
        onStartRequest: function () {},
        onDataAvailable: function (req, ctx, stream, offset, count) {
          /* Binary-safe: try nsIBinaryInputStream, fall back to SIS+charCode loop */
          try {
            var BisCtor = Components.Constructor(
              '@mozilla.org/binaryinputstream;1', 'nsIBinaryInputStream', 'setInputStream');
            chunks.push(new Uint8Array(new BisCtor(stream).readByteArray(count)));
          } catch (eB) {
            var sis = new _SISCtor(stream);
            var s = sis.read(count);
            var arr = new Uint8Array(s.length);
            for (var i = 0; i < s.length; i++) arr[i] = s.charCodeAt(i) & 0xff;
            chunks.push(arr);
          }
          loadedBytes += count;
          updateDlProgress(loadedBytes, 0);
        },
        onStopRequest: function (req, ctx, status) {
          var s = status >>> 0;
          console.log('[cu] onStopRequest status=0x' + s.toString(16));
          state.xhr = null;
          if (s === NS_OK) {
            var blob = new Blob(chunks, { type: 'application/zip' });
            copyToSD(blob);
          } else if (s !== NS_BINDING_ABORTED) {
            tryLocalFile();
          }
        }
      }, null);

    } catch (e) {
      console.error('[cu] exception:', e.message);
      state.xhr = null;
      tryLocalFile();
    }
  }

  function cancelDownload() {
    var xhr = state.xhr;
    state.xhr = null;
    if (xhr) xhr.abort();
    showScreen('select_channel', {}, 'back');
  }

  /* ── Copy blob → sdcard ── */
  function copyToSD(blob) {
    var filename = CHANNEL[state.channel].filename;
    showScreen('copying', { filename: filename });
    var storage = getTargetStorage();
    var del = storage.delete(filename);
    del.onsuccess = del.onerror = function () {
      var save = storage.addNamed(blob, filename);
      save.onsuccess = function () { createCommandFile(filename); };
      save.onerror   = function () { showError(L10n.get('err_copy')); };
    };
  }

  /* ── Create command file on sdcard (reference copy — recovery reads from /cache) ── */
  function createCommandFile(zipFilename) {
    showScreen('creating_command');
    var content = 'boot-recovery\n--update_package=/sdcard/' + zipFilename + '\n';
    var blob    = new Blob([content], { type: 'text/plain' });
    var storage = getTargetStorage();
    var del = storage.delete('command');
    del.onsuccess = del.onerror = function () {
      var save = storage.addNamed(blob, 'command');
      save.onsuccess = function () { moveCommandToCache(zipFilename); };
      save.onerror   = function () { showError(L10n.get('err_command')); };
    };
  }

  /* ── Write recovery command to /cache/recovery/command ── */
  /* XPCOM (nsILocalFile / nsIProcess) không hoạt động trong context certified app
     trên Nokia 8110 4G — thẳng đến màn hình ADB để user chạy lệnh busybox từ PC. */
  function moveCommandToCache(zipFilename) {
    showScreen('adb_ready', { filename: zipFilename }, 'forward');
  }

  /* ── Cancel install ── */
  function cancelInstall() {
    var info    = CHANNEL[state.channel];
    var storage = getTargetStorage();
    storage.delete(info.filename);
    storage.delete('command');
    showScreen('select_channel');
  }

  /* ── Boot to recovery ── */
  function bootToRecovery() {
    try { navigator.mozPower.reboot('recovery'); }
    catch (e) { showScreen('manual_restart'); }
  }

  /* ── Error ── */
  function showError(msg) {
    var wrap = mk('div', 'info-wrap screen');
    var title = mk('div', 'info-title');
    title.style.textTransform = 'uppercase';
    title.textContent = L10n.get('error');
    var text = mk('div', 'info-text');
    text.textContent = msg;
    wrap.appendChild(title); wrap.appendChild(text);

    state.screen = 'error_screen';
    document.getElementById('header').style.display = 'none';
    $content.style.top = '0';
    $content.innerHTML = '';
    $content.appendChild(wrap);
    setSoftkeys('error_screen');
    setTitle('error_screen');
  }

  /* ══════════════════════════════════════
     SCREENS
  ══════════════════════════════════════ */
  var SCREENS = {

    wrong_device: function () {
      var d = mk('div', 'alert-wrap');
      d.innerHTML =
        '<div class="css-icon-error">!</div>' +
        '<div class="alert-title">Incompatible Device</div>' +
        '<div class="alert-text">This app is only for Nokia 8110 4G</div>';
      return d;
    },

    welcome: function () {
      var d = mk('div', 'welcome-wrap');
      d.innerHTML =
        '<div class="welcome-title">Welcome to Upgrade Tool</div>' +
        '<div class="welcome-sub">for Nokia 8110 4G</div>';
      return d;
    },

    no_sdcard: function () {
      var d = mk('div', 'alert-wrap');
      d.innerHTML =
        '<div class="css-icon-sd">SD</div>' +
        '<div class="alert-title">' + esc(L10n.get('no_sdcard_title')) + '</div>' +
        '<div class="alert-text">'  + esc(L10n.get('no_sdcard_text'))  + '</div>';
      return d;
    },

    sdcard_full: function (opts) {
      var d = mk('div', 'alert-wrap');
      var extra = opts.free ? ' (' + fmtBytes(opts.free) + ' free)' : '';
      d.innerHTML =
        '<div class="css-icon-warn"></div>' +
        '<div class="alert-title">' + esc(L10n.get('sdcard_full_title')) + '</div>' +
        '<div class="alert-text">'  + esc(L10n.get('sdcard_full_text')) + esc(extra) + '</div>';
      return d;
    },

    select_channel: function () {
      var d = mk('div', 'select-wrap');
      var ul = mk('ul', 'menu-list');
      ul.appendChild(makeListItem('', 'Stable', '', true));
      ul.appendChild(makeListItem('', 'Canary', '', false));
      d.appendChild(ul);
      return d;
    },

    downloading: function (opts) {
      var d = mk('div', 'progress-wrap');
      d.innerHTML =
        '<div class="prog-title">KaiOS 2.5.4 ' + esc(opts.label || '') + '</div>' +
        '<div class="prog-file">' + esc(L10n.get('downloading')) + '</div>' +
        '<div class="prog-track prog-indeterminate" id="prog-track">' +
          '<div class="prog-fill" id="prog-fill"></div>' +
        '</div>' +
        '<div class="prog-row">' +
          '<span class="prog-pct" id="prog-pct"></span>' +
          '<span class="prog-size" id="prog-size"></span>' +
        '</div>';
      return d;
    },

    copying: function (opts) {
      var d = mk('div', 'progress-wrap');
      d.innerHTML =
        '<div class="prog-title">' + esc(L10n.get('copying')) + '</div>' +
        '<div class="prog-file">'  + esc(opts.filename || '') + '</div>' +
        '<div class="prog-track prog-indeterminate"><div class="prog-fill"></div></div>' +
        '<div class="prog-note">'  + esc(L10n.get('please_wait')) + '</div>';
      return d;
    },

    creating_command: function () {
      var d = mk('div', 'progress-wrap');
      d.innerHTML =
        '<div class="prog-title">' + esc(L10n.get('creating_command')) + '</div>' +
        '<div class="prog-track prog-indeterminate"><div class="prog-fill"></div></div>' +
        '<div class="prog-note">'  + esc(L10n.get('please_wait')) + '</div>';
      return d;
    },

    warning: function () {
      var d = mk('div', 'confirm-wrap');

      var sep1 = mk('div', 'list-sep');
      var s1t = mk('span', 'list-sep-text');
      s1t.style.color = '#e66000';
      s1t.textContent = '! ' + L10n.get('warning_title');
      sep1.appendChild(s1t);

      var body = mk('div', 'confirm-body');
      body.textContent = L10n.get('warning_install') + ' ' + L10n.get('warning_backup');

      var sep2 = mk('div', 'list-sep');
      var s2t = mk('span', 'list-sep-text');
      s2t.style.color = '#d90036';
      s2t.textContent = L10n.get('warning_delete');
      sep2.appendChild(s2t);

      d.appendChild(sep1);
      d.appendChild(body);
      d.appendChild(sep2);
      return d;
    },

    cancel_confirm: function () {
      var d = mk('div', 'confirm-wrap');

      var sep = mk('div', 'list-sep');
      var st = mk('span', 'list-sep-text');
      st.style.color = '#e66000';
      st.textContent = 'Cancel Installation?';
      sep.appendChild(st);

      var body = mk('div', 'confirm-body');
      body.textContent = 'The firmware zip and command files will be deleted.';

      d.appendChild(sep);
      d.appendChild(body);
      return d;
    },

    ssl_cert_error: function () {
      var d = mk('div', 'info-wrap');
      d.innerHTML =
        '<div class="info-title" style="color:#e66000">Trusting cert...</div>' +
        '<div class="info-text" style="margin-top:0.8rem">' +
          'Opening browser automatically.<br><br>' +
          'Accept the certificate, then press <b>Back</b> to return.' +
        '</div>';
      return d;
    },

    adb_ready: function (opts) {
      var d = mk('div', 'info-wrap info-adb');
      var f = opts.filename || '';
      var cmd, note;
      if (state.storageIsExternal) {
        cmd = 'adb shell busybox sh -c \'' +
          'busybox mount -o remount,rw /cache && ' +
          'busybox mkdir -p /cache/recovery && ' +
          'busybox printf "boot-recovery\\n--update_package=/sdcard/' + f + '\\n" > /cache/recovery/command\'';
        note = 'Write the recovery command file:';
      } else {
        cmd = 'adb shell busybox sh -c \'' +
          'busybox cp /storage/emulated/0/' + f + ' /sdcard/ && ' +
          'busybox mount -o remount,rw /cache && ' +
          'busybox mkdir -p /cache/recovery && ' +
          'busybox printf "boot-recovery\\n--update_package=/sdcard/' + f + '\\n" > /cache/recovery/command\'';
        note = 'Copy firmware to SD card &amp; write recovery command:';
      }
      d.innerHTML =
        '<div class="info-title">Run on your PC</div>' +
        '<div class="adb-note">' + note + '</div>' +
        '<pre class="adb-cmd">' + esc(cmd) + '</pre>' +
        '<div class="adb-note">Press <b>OK</b> when done, then confirm to reboot.</div>';
      return d;
    },

    manual_restart: function () {
      var d = mk('div', 'info-wrap');
      d.innerHTML =
        '<div class="info-title">' + esc(L10n.get('manual_title')) + '</div>' +
        '<div class="info-text">'  + esc(L10n.get('manual_text'))  + '</div>';
      return d;
    }
  };

  /* ── Helpers ── */
  function makeListItem(dotColor, text, badge, focused) {
    var li = mk('li', 'list-item' + (focused ? ' focused' : ''));

    var label = mk('span', 'li-text');
    label.textContent = text;

    li.appendChild(label);

    if (badge) {
      var b = mk('span', 'li-badge');
      b.textContent = badge;
      li.appendChild(b);
    }


    return li;
  }

  function mk(tag, cls) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }

  function fmtBytes(b) {
    if (b < 1024)     return b + ' B';
    if (b < 1048576)  return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* writeCertOverride must run at script-eval time while Components is accessible */
  writeCertOverride();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

}());
