/**
 * @file Script for popup.html. Event handling from a user.
 */


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}


/**
 * Starts when the popup.html has the status 'DOMContentLoaded'.
 */
function main() {
    bindActions();
}


/**
 * Binds onclick actions on an HTML elements.
 */
function bindActions() {
    document.getElementById('screenshot-of-posts').onclick = function() {
        sendMessageToContentScript({command: 'createScreenshotOfPosts'});
    };
}


/**
 * Sends the message to the content scripts.
 * 
 * @param {Object} message
 * A message for sending.
 * 
 * @param {function(Object)} callback
 * A callback that handles the response.
 */
function sendMessageToContentScript(message, callback) {
    callback = callback || function() {};

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            callback(response);
        });
    });
}
