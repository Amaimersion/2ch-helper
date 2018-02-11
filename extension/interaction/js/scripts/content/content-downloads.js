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


// It is for archiving files into a .zip archive.
// However, it is sucks on a large pages.
// The current version is very raw and try not to use it.
// I'll turn off it for now. 
// So, someday i either modify it or delete it.
/*
function downloadImagesZip() {
    var thread = document.getElementById('posts-form');

    var previewImages = thread.getElementsByTagName('img');
    var fullImages = [];
    var i = 0;

    while (i != previewImages.length) {
        var fullImage = ContentAPI.getParent(previewImages[i], function(element) {
            return element.tagName === 'A';
        });

        fullImages[i] = fullImage.href;
        i++;
    }

    previewImages = null;
    var zip = new JSZip();
    i = 0;
    var num = 0;

    while (i != fullImages.length) {
        toDataURL(fullImages[i], 'image/jpeg', function(uri) {
            zip.file(String(num) + '.png', uri.slice(22), {base64: true});
            num++;

            if (num === fullImages.length) {
                fullImages = null;

                if (JSZip.support.uint8array) {
                    promise = zip.generateAsync({type : 'blob'});
                } else {
                    promise = zip.generateAsync({type : 'string'});
                }

                promise.then(function(blob) {
                    var url = URL.createObjectURL(blob);
                    ContentAPI.sendMessageToBackground({command: 'downloadZip', url: url});
                });
            }
        });

        i++;
    }
}

function toDataURL(src, outputFormat, callback) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL(outputFormat, 1.0);
        callback(dataURL);
    };

    img.src = src;
}


// function to create a file in the HTML5 temporary filesystem
function createFile(filename, callback) {
    webkitRequestFileSystem(TEMPORARY, 4 * 1024 * 1024, function(fs) {
      fs.root.getFile(filename, { create : true }, callback);
    });
  }

*/
