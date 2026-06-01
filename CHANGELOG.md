# Changelog

## Unreleased

### Added
- Low-battery check before the welcome flow — installation requires at least 25% battery unless the phone is charging.
- Retry action on error screens.
- Cancel-install dialog that deletes the firmware zip and command files.
- Certificate validation before download.
- Factory reset warning.
- `desktop-notification` permission.
- 48 new locale files (af-ZA, az-Latn-AZ, be-BY, bg-BG, cs-CZ, da-DK, el-GR, en-GB, en-NG, es-US, et-EE, fi-FI, fil-PH, fr-CA, he-IL, hr-HR, hu-HU, hy-AM, is-IS, ka-GE, kk-KZ, km-KH, lo-LA, lt-LT, lv-LV, mk-MK, mo-RO, nb-NO, ne-IN, ps-AF, pt-PT, ro-RO, si-LK, sk-SK, sl-SI, sq-AL, sr-Latn-CS, sv-SE, sw-ZA, ta-IN, uk-UA, uz-Cyrl-UZ, xh-ZA, zh-HK, zh-TW, zu-ZA, and more).

### Changed
- Stable channel now points to `KaiOS_2.5.4_Stable_v4-signed.zip`.
- Alert screens (wrong device, no SD card, SD card full, low battery) now render over the welcome background with a gaia-confirm-style dialog sliding up over a dimmed screen.
- Unified all alert/dialog screens through a shared `makeDialog()` / `dialogScreen()` helper using semantic `h1`/`p` markup.
- Locale files renamed from short codes (en, fr, vi…) to full BCP 47 region codes (en-US, fr-FR, vi-VN…).
- `manifest.webapp`: `default_locale` changed from `en` to `en-US`; `locales` expanded to full BCP 47 codes for all supported languages.
- Reorganized app sources into `upgrade-tool-src/`.

### Removed
- Warning disclaimer from README.
