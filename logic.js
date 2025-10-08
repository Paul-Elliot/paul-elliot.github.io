
let deferredPrompt;
const installButton = document.querySelector('#custom-install-button'); // Your custom UI element

window.addEventListener('beforeinstallprompt', (event) => {
    // 1. Prevent the browser's default prompt from appearing
    event.preventDefault();

    // 2. Store the event for later use
    deferredPrompt = event;

    // 3. Reveal your custom "Install" button or pop-up UI
    if (installButton) {
        installButton.removeAttribute('hidden');
    }
});
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            // 1. Show the native install prompt using the stored event
            deferredPrompt.prompt();

            // 2. Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            // 3. Handle the result (user accepted or dismissed)
            console.log(`User response to the install prompt: ${outcome}`);

            // 4. Reset the deferred prompt variable
            deferredPrompt = null;

            // 5. Hide your custom install button/pop-up
            installButton.setAttribute('hidden', '');
        }
    });
}
window.addEventListener('appinstalled', () => {
    // Hide or remove your custom install UI permanently
    if (installButton) {
        installButton.setAttribute('hidden', '');
    }
    console.log('PWA was installed!');
});
const isIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    // Check for the pattern 'iphone', 'ipad', or 'ipod' in the user agent
    return /iphone|ipad|ipod/.test(userAgent);
};

// You might also want to check if the PWA is already installed (optional, but good practice):
const isRunningStandalone = () => {
    return (window.matchMedia('(display-mode: standalone)').matches) ||
        (window.navigator.standalone); // Older iOS check
};

if (isIOS() && !isRunningStandalone()) {
    // Show the custom iOS instructions popup
    showIOSInstallPrompt();
}
function showIOSInstallPrompt() {
    const popup = document.getElementById('ios-install-popup');
    const closeButton = document.getElementById('close-ios-prompt');

    // 1. Display the popup
    if (popup) {
        popup.style.display = 'block';
    }

    // 2. Handle the "Got It!" dismissal
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            if (popup) {
                popup.style.display = 'none';

                // OPTIONAL: Set a cookie or local storage item 
                // to prevent showing the prompt again for a period (e.g., 30 days)
                localStorage.setItem('ios-install-prompt-dismissed', Date.now());
            }
        });
    }
}
