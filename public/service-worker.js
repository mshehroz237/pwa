const APP_PREFIX = 'Tracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    ".",
    "./index.html",
    "./manifest.json",
    "./css/styles.css",
    "./js/index.js",
    "./js/idb.js",
    "./icons/icon-512x512.png",
    "./icons/icon-384x384.png",
    "./icons/icon-192x192.png",
    "./icons/icon-152x152.png",
    "./icons/icon-144x144.png",
    "./icons/icon-128x128.png",
    "./icons/icon-96x96.png",
    "./icons/icon-72x72.png"
];

self.addEventListener('fetch', function(event) {
    console.log('fetch request: ' + event.request.url);
    event.respondWith(
        caches.match(event.request).then(function(request) {
            if (request) { 
                console.log('responding with cache: ' + event.request.url);
                return request;
            } else { 
                console.log('Not cached, fetching: ' + event.request.url);
                return fetch(event.request);
            };
        })
    );
});

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('installing cache: ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keyList) {
            let cacheKeeplist = keyList.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function(key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache: ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});



