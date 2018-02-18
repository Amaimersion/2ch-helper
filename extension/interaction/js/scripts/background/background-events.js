chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
       UserProfile.createProfile(); 
    }
});


function main() {
    BackgroundAPI.getUserSettings();
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
