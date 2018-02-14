/** 
 * The common module for usage in others background modules.
 * 
 * @module BackgroundAPI
 */
function BackgroundAPI() {}


/**
 * Clears a cashe of the background page.
 * It's just reload it, but it's works.
 * 
 * @memberof ContentAPI
 * @static
 */
BackgroundAPI.clearCashe = function() {
    window.location.reload(true);
}


/**
 * Injects a script into the page.
 * 
 * @memberof ContentAPI
 * @static
 * @async
 * 
 * @param {Object} options 
 * An options for execute. 
 * See https://developer.chrome.com/extensions/tabs#method-executeScript
 * 
 * @returns {Promise<undefined>} 
 * A promise for the inject that will resolve when injects are successfully completed.
 * Resolve will contain undefined if success, otherwise reject will contain an error.
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
