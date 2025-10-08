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
    
    // Example: Only show the prompt once every 1min
    const oneMin = 1 * 60 * 1000;
    return (Date.now() - parseInt(dismissedTime, 10)) < oneMin;
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
