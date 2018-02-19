/** 
 * The common module for usage in others background modules.
 * 
 * @module BackgroundAPI
 */
function BackgroundAPI() {}


/**
 * Settings of user.
 * 
 * @memberof BackgroundAPI
 * @static
 * @type {Object}
 */
BackgroundAPI.userSettings = {};


/**
 * Clears a cashe of the background page.
 * It just reload a page, but it's works.
 * 
 * @memberof BackgroundAPI
 * @static
 */
BackgroundAPI.clearCashe = function() {
    window.location.reload(true);
}


/**
 * Gets an user settings from chome storage.
 * After getting they will be setted to BackgroundAPI.userSettings.
 * 
 * @memberof BackgroundAPI
 * @static
 * @async
 */
BackgroundAPI.getUserSettings = function() {
    // what settings to receive.
    const settings = [
        'settings_screenshot',
        'settings_download'
    ];

    chrome.storage.sync.get(settings, (data) => {
        this.userSettings = data;
    });
}


/**
 * Injects a script into the page.
 * 
 * @memberof BackgroundAPI
 * @static
 * @async
 * 
 * @param {Object} options 
 * An options for execute. 
 * See https://developer.chrome.com/extensions/tabs#method-executeScript
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the inject that will resolve when injects are successfully completed.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
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
