function ContentDownloads() {}


ContentDownloads.downloadImages = function(callback) {
    callback = callback || function() {};

    this.processDownload(
        'img.preview:not(.webm-file)',
        'downloadImages',
        callback
    );
}


ContentDownloads.downloadVideo = function(callback) {
    callback = callback || function() {};
    
    this.processDownload(
        'img.webm-file',
        'downloadVideo',
        callback
    );
}


ContentDownloads.downloadMedia = function(callback) {
    callback = callback || function() {};
 
    this.downloadImages(() => {
        this.downloadVideo(callback);
    });
}


ContentDownloads.downloadThread = function(callback) {
    callback = callback || function() {};
    const message = {type: 'command', command: 'downloadThread'};

    ContentAPI.sendMessageToBackground(message, () => {
        callback();
    });
}


// я не указываю параметр condition.
// если в странице изменится структура, 
// то этот параметер может понадобиться.
ContentDownloads.processDownload = function(query, command, callback) {
    const thread = ContentAPI.getThread();
    let previewElements = thread.querySelectorAll(query);
    const fullElements = [];

    for (let element of previewElements) {
        let fullElement = ContentAPI.getParent(element, (elem) => {
            return (elem.tagName === 'A');
        });

        fullElements.push(fullElement.href);
    }

    previewElements = [];
    callback = callback || function() {};
    const message = {
        type: 'command',
        command: command,
        data: fullElements
    };

    ContentAPI.sendMessageToBackground(message, (response) => {
        callback(response);
    });
}
