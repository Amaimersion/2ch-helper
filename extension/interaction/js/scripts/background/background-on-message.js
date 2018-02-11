function BackgroundMessage() {}


BackgroundMessage.onMessage = function(request, sender, sendResponse) {
    if (request.type === 'command') {
        BackgroundMessage.commandHandler(request, sendResponse);
        return true;
    } else {
        BackgroundMessage.errorHandler(request, sender, sendResponse);
        return true;
    }
}


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
            BackgroundDownloads.download({url: uri, filename: 'posts.jpg'});
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
            BackgroundDownloads.download({url: uri, filename: 'thread.jpg'});
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


chrome.runtime.onMessage.addListener(BackgroundMessage.onMessage);
