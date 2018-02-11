function BackgroundAPI() {}


BackgroundAPI.clearCashe = function() {
    window.location.reload(true);
}


BackgroundAPI.injectScript = function(options) {
    return new Promise((resolve, reject) => {
        chrome.tabs.executeScript(options, (result) => {
            if (result) {
                return resolve();
            } else {
                const error = new Error();
                error.message = 'Failed to inject script.';
                
                return reject(error);
            }
        });
    });
}
