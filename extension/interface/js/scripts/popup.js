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
        sendMessageToContent({
            type: 'API',
            name: 'screenshot',
            method: 'createScreenshotOfPosts'
        });
    };

    document.getElementById('screenshot-of-thread').onclick = function() {
        sendMessageToContent({
            type: 'API',
            name: 'screenshot',
            method: 'createScreenshotOfThread'
        });
    }

    document.getElementById('download-images').onclick = function() {
        sendMessageToContent({
            type: 'API',
            name: 'download',
            method: 'downloadImages'
        });
    };

    document.getElementById('download-video').onclick  = function() {
        sendMessageToContent({
            type: 'API',
            name: 'download',
            method: 'downloadVideo'
        });
    };

    document.getElementById('download-media').onclick  = function() {
        sendMessageToContent({
            type: 'API',
            name: 'download',
            method: 'downloadMedia'
        });
    };

    document.getElementById('download-thread').onclick = function() {
        sendMessageToContent({
            type: 'API',
            name: 'download',
            method: 'downloadThread'
        });
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
function sendMessageToContent(message, callback) {
    callback = callback || function() {};

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            callback(response);
        });
    });
}

