/** 
 * The module that handles messages.
 * Can handle messages of the following types: 'command'.
 * 
 * @module BackgroundMessage
 */
function BackgroundMessage() {}


/**
 * Handles messages.
 * 
 * @memberof BackgroundMessage
 * @static
 * 
 * @param {Object} request
 * @param {Object} sender 
 * @param {Object} sendResponse 
 * 
 * @returns {Boolean} 
 * Returns true because there will be an asynchronous response.
 */
BackgroundMessage.onMessage = function(request, sender, sendResponse) {
    if (request.type === 'command') {
        BackgroundMessage.commandHandler(request, sendResponse);
        return true;
    } else {
        BackgroundMessage.errorHandler(request, sender, sendResponse);
        return true;
    }
}


/**
 * Handles command type messages.
 * 
 * @memberof BackgroundMessage
 * @static
 * @async
 * 
 * @param {Object} request 
 * @param {Object} sendResponse 
 * 
 * @throws {Error} Throws an error if occurs.
 */
BackgroundMessage.commandHandler = function(request, sendResponse) {
    const command = request.command;

    if (command === 'downloadThread') {
        const promise = BackgroundDownloads.downloadThread();

        promise.then(() => {
            sendResponse({status: true});
        }, (error) => {
            sendResponse({status: false, error: error});
            throw error;
        });

    } else if (command === 'downloadImages') {
        const promise = BackgroundDownloads.downloadImages(request.data);

        promise.then(() => {
            sendResponse({status: true});
        }, (error) => {
            sendResponse({status: false, error: error});
            throw error;
        });

    } else if (command === 'downloadVideo') {
        const promise = BackgroundDownloads.downloadVideo(request.data);

        promise.then(() => {
            sendResponse({status: true});
        }, (error) => {
            sendResponse({status: false, error: error});
            throw error;
        });

    } else if (command === "createScreenshot") {
        const promise = BackgroundScreenshot.createScreenshot(request.coordinate);

        promise.then(() => {
            sendResponse({status: true});
        }, (error) => {
            BackgroundAPI.clearCashe();
            sendResponse({status: false});
            throw error;
        })

    } else if (command === "createPostsImage") {
        const promise = BackgroundScreenshot.createPostsImage();

        promise.then((uri) => {
            const filename = (
                BackgroundAPI.userSettings.settings_screenshot.fileNamePosts + 
                '.' +
                BackgroundAPI.userSettings.settings_screenshot.format
            );

            BackgroundDownloads.download({url: uri, filename: filename});
            BackgroundAPI.clearCashe();
            sendResponse({status: true});
        }, (error) => {
            BackgroundAPI.clearCashe();
            sendResponse({status: false, error: error});
            throw error;
        });

    } else if (command === "createThreadImage") {
        const promise = BackgroundScreenshot.createThreadImage();

        promise.then((uri) => {
            const filename = (
                BackgroundAPI.userSettings.settings_screenshot.fileNameThread + 
                '.' +
                BackgroundAPI.userSettings.settings_screenshot.format
            );

            BackgroundDownloads.download({url: uri, filename: filename});
            BackgroundAPI.clearCashe();
            sendResponse({status: true});
        }, (error) => {
            BackgroundAPI.clearCashe();
            sendResponse({status: false, error: error});
            throw error;
        });

    } else if (command === 'injectScript') {
        const options = {
            file: request.path
        };
        const promise = BackgroundAPI.injectScript(options);

        promise.then(() => {
            sendResponse({status: true});
        }, (error) => {
            sendResponse({status: false, error: error});
            throw error;
        });
    }
}


/**
 * Handles unknown type messages.
 * 
 * @memberof BackgroundMessage
 * @static
 * 
 * @param {Object} request 
 * @param {Object} sender 
 * @param {Object} sendResponse
 * 
 * @throws {Error} Throws an error with request information.
 */
BackgroundMessage.errorHandler = function(request, sender, sendResponse) {
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
chrome.runtime.onMessage.addListener(BackgroundMessage.onMessage);
