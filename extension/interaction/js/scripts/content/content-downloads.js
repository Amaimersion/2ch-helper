/** 
 * The module that handle download requests.
 * 
 * @module ContentDownloads
 */
function ContentDownloads() {}


/**
 * Downloads images.
 * 
 * @memberof ContentDownloads
 * @static
 * @async
 * @param {function(Object)} [callback] 
 * A callback that executes after download and handles the response.
 */
ContentDownloads.downloadImages = function(callback) {
    callback = callback || function() {};

    this.processDownload(
        'img.preview:not(.webm-file)',
        'downloadImages',
        null,
        callback
    );
}


/**
 * Downloads video.
 * 
 * @memberof ContentDownloads
 * @static
 * @async
 * @param {function(Object)} [callback] 
 * A callback that executes after download and handles the response.
 */
ContentDownloads.downloadVideo = function(callback) {
    callback = callback || function() {};
    
    this.processDownload(
        'img.webm-file',
        'downloadVideo',
        null,
        callback
    );
}


/**
 * Downloads media content.
 * 
 * @memberof ContentDownloads
 * @static
 * @async
 * @param {function(Object)} [callback] 
 * A callback that executes after download and handles the response.
 */
ContentDownloads.downloadMedia = function(callback) {
    callback = callback || function() {};
 
    this.downloadImages(() => {
        this.downloadVideo(callback);
    });
}


/**
 * Downloads thread.
 * 
 * @memberof ContentDownloads
 * @static
 * @async
 * @param {function(Object)} [callback] 
 * A callback that executes after download and handles the response.
 */
ContentDownloads.downloadThread = function(callback) {
    callback = callback || function() {};
    const message = {type: 'command', command: 'downloadThread'};

    ContentAPI.sendMessageToBackground(message, (response) => {
        callback(response);
    });
}


/**
 * Downloads an elements.
 * 
 * @memberof ContentDownloads
 * @static
 * @async 
 * 
 * @param {String} selector 
 * A query selector for getting preview elements.
 * 
 * @param {String} command 
 * A command that executes download process in background script.
 * Can be 'downloadThread', or 'downloadImages', or 'downloadVideo'.
 * 
 * @param {function(HTMLElement) => Boolean} [condition] 
 * A condition for getting element href. 
 * Defaults to (return element.tagName === 'A').
 * 
 * @param {function(Object)} [callback] 
 * A callback that executes after download and handles the response.
 */
ContentDownloads.processDownload = function(selector, command, condition, callback) {
    const thread = ContentAPI.getThread();
    let previewElements = thread.querySelectorAll(selector);

    const fullElementsHrefs = [];
    condition = condition || function(element) {return element.tagName === 'A'};

    for (let element of previewElements) {
        let fullElement = ContentAPI.getParent(element, condition);
        fullElementsHrefs.push(fullElement.href);
    }

    previewElements = [];
    callback = callback || function() {};
    const message = {
        type: 'command',
        command: command,
        data: fullElementsHrefs
    };

    ContentAPI.sendMessageToBackground(message, (response) => {
        callback(response);
    });
}
