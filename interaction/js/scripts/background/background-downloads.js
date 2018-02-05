chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === 'downloadThread') {
        downloadThread();
    } else if (request.command === 'downloadZip') {
        chrome.downloads.download({url: request.url, filename: "1.zip"});
    } else if (request.command === 'downloadImages') {
        // сделать функцию определения формата.
        for (var i = 0; i != request.images.length; i++) {
            (function(i) {
                setTimeout(function() {
                    chrome.downloads.download({
                        url: request.images[i], 
                        filename: String(i) + '.jpg'
                    });

                    if (i + 1 === request.images.length) {
                        sendResponse({status: true});
                    }
                }, 500 * i);
            })(i);
        }
        return true;
    } else if (request.command === 'downloadVideo') {
        // сделать функцию определения формата.
        for (var i = 0; i != request.videos.length; i++) {
            (function(i) {
                setTimeout(function() {
                    chrome.downloads.download({
                        url: request.videos[i], 
                        filename: String(i) + '.webm'
                    });

                    if (i + 1 === request.videos.length) {
                        sendResponse({status: true});
                    }
                }, 500 * i);
            })(i);
        }
        return true;
    }
});


function downloadThread() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.pageCapture.saveAsMHTML({tabId: tabs[0].id}, function(MHTML) {
            var url = URL.createObjectURL(MHTML);
            chrome.downloads.download({url: url, filename: "thread.mhtml"});
        });
    });
}
