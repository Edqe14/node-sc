importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js');

workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: null },
  { url: '/SC.html', revision: null },
  { url: '/sc.js.html', revision: null },
  { url: '/styles/prettify-tomorrow.css', revision: null },
  { url: '/styles/jsdoc-default.css', revision: null },
  { url: '/scripts/prettify/prettify.js', revision: null },
  { url: '/scripts/prettify/lang-css.js', revision: null },
  { url: '/scripts/linenumber.js', revision: null },
  { url: '/images/node-sc.ico', revision: null },
  { url: '/images/node-sc.png', revision: null },
  { url: '/images/streamcompanion.png', revision: null },
  { url: '/manifest.json', revision: null }
]);
workbox.routing.setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return workbox.precaching.matchPrecache('/offline.html');
  }

  return Response.error();
});

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'images',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200]
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({ request }) => request.destination === 'fonts' || request.destination === 'scripts',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [200]
      })
    ]
  })
);
