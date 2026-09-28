// Resolves the app language (maestro test -e APP_LANG=ko|en, default ko) and the
// palette names typed into the save dialog. Keys match the photo slots in
// scripts/capture-screenshots.mjs.
var NAMES = {
  ko: {
    hero: '해바라기 블록',
    library1: '야자수 언덕',
    library2: '민트 계단',
    library3: '무지개 계단',
    library4: '노을 계단',
  },
  en: {
    hero: 'Sunflowers',
    library1: 'Palm Hill',
    library2: 'Mint Steps',
    library3: 'Rainbow Path',
    library4: 'Golden Steps',
  },
};

// A default in the flow's env block would override -e, so it lives here.
output.lang = typeof APP_LANG !== 'undefined' && NAMES[APP_LANG] ? APP_LANG : 'ko';
output.names = NAMES[output.lang];
