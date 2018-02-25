/**
 * Script for popup.html. Event handling from a user.
 * 
 * @module Popup
 */
function Popup() {}


Popup.Message = function(type, name, method) {
    this.type = type || undefined;
    this.name = name || undefined;
    this.method = method || undefined;
}


Popup.elementsEvents = [
    {
        id: 'screenshot-of-posts',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'screenshot', 'createScreenshotOfPosts')
            );
        }
    },
    {
        id: 'screenshot-of-thread',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'screenshot', 'createScreenshotOfThread')
            );
        }
    },
    {
        id: 'download-images',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadImages')
            );
        }
    },
    {
        id: 'download-video',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadVideo')
            );
        }
    },
    {
        id: 'download-media',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadMedia')
            );
        }
    },
    {
        id: 'download-thread',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadThread')
            );
        }
    }
];


/**
 * Starts when the popup.html has the status 'DOMContentLoaded'.
 */
Popup.main = function() {
    Popup.bindEvents();
}


/**
 * Binds onclick events on an HTML elements.
 */
Popup.bindEvents = function() {
    for (let elementEvent of Popup.elementsEvents) {
        const element = document.getElementById(elementEvent.id);
        element[elementEvent.type] = elementEvent.event;
    }
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
Popup.sendMessageToContent = function(message, callback) {
    callback = callback || function() {};

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
            callback(response);
        });
    });
}


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Popup.main);
} else {
    Popup.main();
}
