function onMessage(request, sender, sendResponse) {
    if (request.command === 'downloadImages') {
        downloadImages();
    } else if (request.command === 'downloadVideo') {
        downloadVideo();
    } else if (request.command === 'downloadMedia') {
        downloadMedia();
    }
}


function downloadMedia() {
    downloadImages(function(response) {
        if (response.status === true) {
            downloadVideo();
        }
    });
}


function downloadVideo(callback) {
    var thread = document.getElementById('posts-form');

    var previewVideos = thread.querySelectorAll('img.webm-file');
    var fullVideos = [];
    var i = 0;

    while (i != previewVideos.length) {
        var fullVideo = getParent(previewVideos[i], function(element) {
            return (element.tagName === 'A');
        });

        fullVideos[i] = fullVideo.href;
        i++;
    }

    previewVideos = null;

    callback = callback || function() {};
 
    sendMessageToBackgroundScript({command: 'downloadVideo', videos: fullVideos}, function(response) {
        callback(response);
    });
}


function downloadImages(callback) {
    var thread = document.getElementById('posts-form');

    var previewImages = thread.querySelectorAll('img.preview:not(.webm-file)');
    var fullImages = [];
    var i = 0;

    while (i != previewImages.length) {
        var fullImage = getParent(previewImages[i], function(element) {
            return (element.tagName === 'A');
        });

        fullImages[i] = fullImage.href;
        i++;
    }

    previewImages = null;
    callback = callback || function() {};

    sendMessageToBackgroundScript({command: 'downloadImages', images: fullImages}, function(response) {
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
        var fullImage = getParent(previewImages[i], function(element) {
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
                    sendMessageToBackgroundScript({command: 'downloadZip', url: url});
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


/**
 * Gets a parent of the HTML element.
 * 
 * @param {HTMLElement} element 
 * A beginning element.
 * 
 * @param {function(HTMLElement) => Boolean} condition
 * A condition to complete.
 * 
 * @returns {HTMLElement}
 * If condition was not declared, then document will be return.
 * Otherwise element which satisfies condition will be return.
 */
function getParent(element, condition) {
    condition = condition || function(element) {return false;};
    var parent;

    do {
        parent = element;
        element = element.parentNode;
    } while (element && !condition(parent));

    return parent;
}

function sendMessageToBackgroundScript(message, callback) {
    callback = callback || function() {};

    chrome.runtime.sendMessage(message, function(response) {
        callback(response);
    });
}

chrome.runtime.onMessage.addListener(onMessage);

