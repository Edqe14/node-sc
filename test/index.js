const StreamCompanion = require('../src/sc.js');
const SC = new StreamCompanion({
  watchTokens: [
    'score',
    'combo'
  ],
  initializeAutomatically: false
});
SC.initialize();

(async () => {
  console.log('[METHODS] checking...\n');
  let tested = 0;
  await SC.getBackground()
    .then(() => console.log('[GET BACKGROUND] success', ++tested))
    .catch((e) => console.error('[GET BACKGROUND] error', e));
  await SC.getJson()
    .then(() => console.log('[GET JSON] success', ++tested))
    .catch((e) => console.error('[GET JSON] error', e));
  await SC.getOverlayList()
    .then(() => console.log('[GET OVERLAY LIST] success', ++tested))
    .catch((e) => console.error('[GET OVERLAY LIST] error', e));
  await SC.getSettings()
    .then(() => console.log('[GET SETTINGS] success', ++tested))
    .catch((e) => console.error('[GET SETTINGS] error', e));
  if (tested === 4) console.log('\n[METHODS] checked\n');
  listen();
})();

const listen = () => {
  console.log('[EVENTS] listening...\n');
  if (!SC.initialized) console.log('[EVENTS] not initialized.\n');
  SC.on('ready', (type) => console.log('[EVENT] ready', type));
  SC.on('disconnect', (type) => console.log('[EVENT] disconnect', type));
  SC.on('reconnecting', (type) => console.log('[EVENT] reconnecting', type));
  SC.on('error', raw => console.log('[EVENT] error', raw));
  SC.on('data', raw => console.log('[EVENT] data', raw));
};
