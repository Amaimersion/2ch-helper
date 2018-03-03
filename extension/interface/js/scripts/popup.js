/**
 * Script for popup.html.
 * 
 * @module Popup
 */
function Popup() {}


/**
 * Message template.
 * 
 * @memberof Popup
 * @static
 * @constructor
 * 
 * @param {String} type
 * A type of the message.
 * Can be: 'API'.
 * 
 * @param {String} name
 * If type === 'API', then a name of another content module.
 * 
 * @param {String} method
 * If type === 'API', then a method of another content module.
 */
Popup.Message = function(type, name, method) {
    this.type = type || undefined;
    this.name = name || undefined;
    this.method = method || undefined;
}


/** 
 * Events for the page elements.
 * 
 * @memberof Popup
 * @static
 * @type {Array<Object>}
 */
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
 * 
 * @memberof Popup
 * @static
 */
Popup.main = function() {
    Popup.bindEvents();
}


/**
 * Binds events on an elements of the page.
 * Elements and events are taken from Popup.elementsEvents.
 * 
 * @memberof Popup
 * @static
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
 * @memberof Popup
 * @static
 * 
 * @param {Object} message
 * A message for sending.
 * 
 * @param {function(Object)} callback
 * A callback that handles the response.
 */
Popup.sendMessageToContent = function(message, callback) {
    callback = callback || function() {};

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
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
