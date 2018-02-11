function ContentMessage() {}


ContentMessage.onMessage = function(request, sender, sendResponse) {
    if (request.type === 'API') {
        ContentMessage.APIHandler(request, sendResponse);
        return true;
    } else {
        ContentMessage.errorHandler(request, sender, sendResponse);
        return true;
    }
}


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


chrome.runtime.onMessage.addListener(ContentMessage.onMessage);
