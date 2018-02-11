function BackgroundDownloads() {}


BackgroundDownloads.downloadThread = function() {
    return new Promise((resolve, reject) => {
        const query = {active: true, currentWindow: true};

        chrome.tabs.query(query, (tabs) => {
            const captureOptions = {tabId: tabs[0].id};
            let name = (tabs[0].title || 'thread') + '.mhtml';
            name = this.fixFileName(name);

            chrome.pageCapture.saveAsMHTML(captureOptions, (mhtml) => {
                const url = URL.createObjectURL(mhtml);
                const downloadOptions = {
                    url: url,
                    filename: name
                };

                this.download(downloadOptions).then(() => {
                    return resolve();
                });
            });
        });
    });
}


BackgroundDownloads.downloadImages = function(urls) {
    return new Promise((resolve, reject) => {
        this.downloadData(urls).then(() => {
            return resolve();
        }, (error) => {
            return reject(error);
        });
    });
}


BackgroundDownloads.downloadVideo = function(urls) {
    return new Promise((resolve, reject) => {
        this.downloadData(urls).then(() => {
            return resolve();
        }, (error) => {
            return reject(error);
        });
    });
}


BackgroundDownloads.download = function(options) {
    return new Promise((resolve, reject) => {
        chrome.downloads.download(options, (downloadId) => {
            return resolve(downloadId);
        });
    });
}


BackgroundDownloads.downloadData = function(urls, fileName, fileFormat, downloadOptions) {
    return new Promise((resolve, reject) => {
        downloadOptions = downloadOptions || {};
        let downloadPromise = Promise.resolve();

        for (let url of urls) {
            downloadPromise = downloadPromise.then(() => {
                return new Promise((res) => {
                    const name = (
                        fileName || 
                        this.determineFileName(url) || 
                        'undefined'
                    ); 
                    const format = (
                        fileFormat || 
                        this.determineFileFormat(url) || 
                        ''
                    );

                    downloadOptions.url = url;
                    downloadOptions.filename = name + format;

                    window.setTimeout(() => {
                        this.download(downloadOptions).then(() => {
                            return res();
                        });
                    }, 500);
                });
            });
        }

        downloadPromise.then(() => {
            return resolve();
        }, () => {
            const error = new Error();
            error.message = 'Failed to download.';
            
            return reject(error);
        });
    });
}


BackgroundDownloads.determineFileName = function(url) {
    const lastIndex = url.lastIndexOf('.');
    const preLastIndex = url.lastIndexOf('/');

    if (lastIndex === -1 || preLastIndex === -1) {
        return undefined;
    } else {
        return url.slice(preLastIndex + 1, lastIndex);
    }
}


BackgroundDownloads.determineFileFormat = function(url) {
    const lastIndex = url.lastIndexOf('.');

    if (lastIndex === -1) {
        return undefined;
    } else {
        return url.slice(lastIndex);   
    }
}


BackgroundDownloads.fixFileName = function(name, char) {
    return name.replace(/[\\\/\:\*\?\"\<\>\|]/g, char || '');
}
