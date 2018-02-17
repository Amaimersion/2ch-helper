chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
       UserProfile.createProfile(); 
    }
});