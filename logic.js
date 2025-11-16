if ("serviceWorker" in navigator) {
    // Installs service worker for offline PWA access
    navigator.serviceWorker.register("service-worker.js");
}

let installPromptEvent;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPromptEvent = event;

    event.userChoice.then((result) => {
        console.log(result.outcome);
    });
}); 

document.addEventListener("DOMContentLoaded", function () {
    // Buttons event handlers

    var button = document.getElementById("myButton");

    // Attach a click event listener to the button
    button.addEventListener("click", function () {
        console.log("here");
        if (installPromptEvent) {
        installPromptEvent.prompt();
        } else {
        alert("Prompt not avaialble");
        }
        // You can add more JavaScript code to be executed when the button is clicked
    });
});