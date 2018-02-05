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
    bindEvents();
}


/**
 * Binds onclick events on an HTML elements.
 */
function bindEvents() {
    document.getElementById('screenshot-of-posts').onclick = function() {
        sendMessageToContentScript({command: 'createScreenshotOfPosts'});
    };

    document.getElementById('screenshot-of-thread').onclick = function() {
        sendMessageToContentScript({command: 'createScreenshotOfThread'});
    }

    document.getElementById('download-images').onclick = function() {
        sendMessageToContentScript({command: 'downloadImages'});
    };

    document.getElementById('download-video').onclick  = function() {
        sendMessageToContentScript({command: 'downloadVideo'});
    };

    document.getElementById('download-media').onclick  = function() {
        sendMessageToContentScript({command: 'downloadMedia'});
    };

    document.getElementById('download-thread').onclick = function() {
        sendMessageToBackgroundScript({command: 'downloadThread'});
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


/**
 * Sends the message to the background scripts.
 * 
 * @param {Object} message
 * A message for sending.
 * 
 * @param {function(Object)} callback
 * A callback that handles the response.
 */
function sendMessageToBackgroundScript(message, callback) {
    callback = callback || function() {};

    chrome.runtime.sendMessage(message, function(response) {
        callback(response);
    });
}
