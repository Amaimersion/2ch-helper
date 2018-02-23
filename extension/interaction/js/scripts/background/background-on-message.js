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
BackgroundMessage.commandHandler = async function(request, sendResponse) {
    const command = request.command;

    if (command === 'downloadThread') {
        try {
            await BackgroundDownloads.downloadThread();
        } catch (error) {
            sendResponse({status: false, error: error});
            throw error;
        }

        sendResponse({status: true});

    } else if (command === 'downloadImages') {
        try {
            await BackgroundDownloads.downloadImages(request.data);
        } catch (error) {
            sendResponse({status: false, error: error});
            throw error;
        }

        sendResponse({status: true});

    } else if (command === 'downloadVideo') {
        try {
            await BackgroundDownloads.downloadVideo(request.data);
        } catch (error) {
            sendResponse({status: false, error: error});
            throw error;
        }

        sendResponse({status: true});

    } else if (command === "createScreenshot") {
        try {
            await BackgroundScreenshot.createScreenshot(request.coordinate);
        } catch (error) {
            BackgroundAPI.clearCashe();
            sendResponse({status: false});
            throw error;
        }

        sendResponse({status: true});

    } else if (command === "createPostsImage") {
        let uri = '';

        try {
            uri = await BackgroundScreenshot.createPostsImage();
        } catch (error) {
            BackgroundAPI.clearCashe();
            sendResponse({status: false, error: error});
            throw error;
        }

        const filename = (
            BackgroundAPI.userSettings.settings_screenshot.fileNamePosts + 
            '.' +
            BackgroundAPI.userSettings.settings_screenshot.format
        );

        BackgroundDownloads.download({url: uri, filename: filename});
        BackgroundAPI.clearCashe();
        sendResponse({status: true});

    } else if (command === "createThreadImage") {
        let uri = '';

        try {
            uri = await BackgroundScreenshot.createThreadImage();
        } catch (error) {
            BackgroundAPI.clearCashe();
            sendResponse({status: false, error: error});
            throw error;
        }

        const filename = (
            BackgroundAPI.userSettings.settings_screenshot.fileNameThread + 
            '.' +
            BackgroundAPI.userSettings.settings_screenshot.format
        );

        BackgroundDownloads.download({url: uri, filename: filename});
        BackgroundAPI.clearCashe();

    } else if (command === 'injectScript') {
        const options = {
            file: request.path
        };

        try {
            await BackgroundAPI.injectScript(options);
        } catch (error) {
            sendResponse({status: false, error: error});
            throw error;
        }

        sendResponse({status: true});
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
