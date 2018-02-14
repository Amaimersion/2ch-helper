/** 
 * The module that handles messages.
 * Can handle messages of the following types: 'API'.
 * 
 * @module ContentMessage
 */
function ContentMessage() {}


/**
 * Handles messages.
 * 
 * @memberof ContentMessage
 * @static
 * 
 * @param {Object} request
 * @param {Object} sender 
 * @param {Object} sendResponse 
 * 
 * @returns {Boolean} 
 * Returns true because there will be an asynchronous response.
 */
ContentMessage.onMessage = function(request, sender, sendResponse) {
    if (request.type === 'API') {
        ContentMessage.APIHandler(request, sendResponse);
        return true;
    } else {
        ContentMessage.errorHandler(request, sender, sendResponse);
        return true;
    }
}


/**
 * Handles API type messages.
 * 
 * @memberof ContentMessage
 * @static
 * @async
 * 
 * @param {Object} request 
 * @param {Object} sendResponse 
 * 
 * @throws {Error} Throws an error if occurs.
 */
ContentMessage.APIHandler = function(request, sendResponse) {
    const promise = ContentAPI.executeAnotherAPI(
        request.name, 
        request.method
    );

    promise.then(() => {
        sendResponse({status: true});
    }, (error) => {
        sendResponse({status: false, error: error});
        throw error;
    });
}


/**
 * Handles unknown type messages.
 * 
 * @memberof ContentMessage
 * @static
 * 
 * @param {Object} request 
 * @param {Object} sender 
 * @param {Object} sendResponse
 * 
 * @throws {Error} Throws an error with request information.
 */
ContentMessage.errorHandler = function(request, sender, sendResponse) {
    console.log(
        'An unknown request was received.\n',
        'Sender - ', sender, '\n',
        'Request - ', request
    );

    const error = new Error();
    error.message = 'An unknown request.';

    sendResponse({
        status: false,
        error: error,
        details: {
            request: request,
            sender: sender
        }
    });

    throw error;
}


/** 
 * Sets a message handler. 
 */
chrome.runtime.onMessage.addListener(ContentMessage.onMessage);
