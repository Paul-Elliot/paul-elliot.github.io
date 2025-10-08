// Define a name for the cache (change the version number to force a refresh)
const CACHE_NAME = 'basic-pwa-cache-v4';

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

let deferredPrompt;
const installButton = document.querySelector('#custom-install-button');
const iosPopup = document.querySelector('#ios-install-popup');
const closeIosButton = document.querySelector('#close-ios-prompt');

// === Helper Functions for Device Detection ===

const isIOS = () => {
    // Check for iPhone, iPad, or iPod in the user agent
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
};

const isRunningStandalone = () => {
    // Check if the app is already installed and running in PWA mode
    return (window.matchMedia('(display-mode: standalone)').matches) || 
           (window.navigator.standalone); // window.navigator.standalone is for older iOS
};

const hasDismissedPrompt = () => {
    // Check if the user has previously dismissed the iOS prompt
    const dismissedTime = localStorage.getItem('ios-install-prompt-dismissed');
    if (!dismissedTime) return false;
    
    // Example: Only show the prompt once every 7 days (604,800,000 milliseconds)
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - parseInt(dismissedTime, 10)) < sevenDays;
};

// === 1. Installation Logic for Chromium-based Browsers ===

window.addEventListener('beforeinstallprompt', (event) => {
    // Only proceed if not on iOS
    if (isIOS()) return; 

    // Prevent the default browser UI
    event.preventDefault(); 
    
    // Store the event and reveal the custom button
    deferredPrompt = event;
    if (installButton) {
        installButton.removeAttribute('hidden');
    }
});

if (installButton) {
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            // Hide the custom button before showing the native prompt
            installButton.setAttribute('hidden', '');
            
            // Trigger the native installation prompt
            deferredPrompt.prompt(); 

            // Wait for user choice (accepted or dismissed)
            await deferredPrompt.userChoice;

            // Reset the prompt reference
            deferredPrompt = null; 
        }
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

