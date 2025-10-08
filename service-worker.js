// Define a name for the cache (change the version number to force a refresh)
const CACHE_NAME = 'basic-pwa-cache-v8';

// List of files to cache (your 'app shell')
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
    // Add paths to your icons and CSS/JS files here too
];

// 1. Install Event: Cache all the necessary files
self.addEventListener('install', event => {
    console.log('[Service Worker] Install Event');
    // waitUntil ensures the service worker is not installed until caching is complete
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                // Adds all listed files to the cache
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Fetch Event: Intercept network requests and serve from cache if available
self.addEventListener('fetch', event => {
    // Check if the requested resource is in the cache
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return the cached response
                if (response) {
                    console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                    return response;
                }
                // No cache hit - fetch from the network
                console.log(`[Service Worker] Serving from network: ${event.request.url}`);
                return fetch(event.request);
            })
    );
});

// 3. Activate Event: Clean up old caches (important for updates)
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate Event - Cleaning old caches');
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete any cache names that are not in the whitelist
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

});


}


// === 2. Installation Logic for iOS (Manual Instructions) ===

function showIOSInstallPrompt() {
    if (iosPopup) {
        // Display the instructional popup
        iosPopup.style.display = 'block';

        if (closeIosButton) {
            closeIosButton.addEventListener('click', () => {
                // Hide the popup and record the dismissal time
                iosPopup.style.display = 'none';
                localStorage.setItem('ios-install-prompt-dismissed', Date.now().toString());
            });
        }
    }
}

// === 3. Check and Show the Appropriate Prompt on Page Load ===

if (isIOS() && !isRunningStandalone() && !hasDismissedPrompt()) {
    // If on iOS, not installed, and not recently dismissed, show instructions
    showIOSInstallPrompt();
} 
// The Android/Desktop prompt is handled automatically by the beforeinstallprompt listener


// === 4. Global App Installed Handler ===

window.addEventListener('appinstalled', () => {
    // Hide all related install prompts/buttons when the PWA is successfully installed
    if (installButton) installButton.setAttribute('hidden', '');
    if (iosPopup) iosPopup.style.display = 'none';
    console.log('PWA successfully installed. Thanks!');
});
