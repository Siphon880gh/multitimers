self.addEventListener("install", event => {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();

    event.waitUntil(
        caches.open("precache-v3").then(cache => {
            // Caching path does not have to be preceded with `public/` because starting the path with `/`
            // will start off the path from wherever Express delivered the HTML route
            const filesToCache = [
                "/",
                "/tools/multitimers/index.html",
                "/tools/multitimers/assets/css/index.css",
                "/tools/multitimers/assets/js/app.js",
                "/tools/multitimers/assets/js/beep.js",
                "/tools/multitimers/assets/js/vendors/articulate.js/articulate.min.js",
                "/tools/multitimers/assets/js/vendors/HackTimer.min.js",
                "/tools/multitimers/manifest.json",
                "/tools/multitimers/sw.js"
            ];

            cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});