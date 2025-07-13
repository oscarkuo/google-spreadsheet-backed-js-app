const CACHE_NAME = 'google-spreadsheet-backed-js-app-cache';
const FILES_TO_CACHE = [
  './index.html',
  './script.js',
];

// Cache local files on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

function getCacheKey(url) {
  const parsed = new URL(url);
  if (parsed.pathname.endsWith('/')) {
    parsed.pathname += 'index.html';
    return parsed.toString();
  }
  return url;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' ||
      url.origin !== self.location.origin) {
    return; // if request is not GET for a local resource, passthrough request
  }

  const cacheKey = getCacheKey(url);

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(cacheKey, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        return caches.match(cacheKey);
      })
  );
});

