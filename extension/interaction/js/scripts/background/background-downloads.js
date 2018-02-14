/** 
 * The module that handles download requests.
 * 
 * @module BackgroundDownloads
 */
function BackgroundDownloads() {}


/**
 * Delay for downloading.
 * 
 * @memberof BackgroundDownloads
 * @static
 * @type {Number}
 */
BackgroundDownloads.downloadDelay = 500;


/**
 * Downloads a thread.
 * 
 * @memberof BackgroundDownloads
 * @static
 * @async
 * 
 * @returns {Promise<null>} 
 * A promise for the download that will resolve when download are successfully completed.
 * Resolve will contain nothing if success.
 */
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


/**
 * Downloads an images.
 * 
 * @memberof BackgroundDownloads
 * @static
 * @async
 * 
 * @param {Array<String>} urls An urls for download.
 *  
 * @returns {Promise<null>} 
 * A promise for the download that will resolve when download are successfully completed.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
BackgroundDownloads.downloadImages = function(urls) {
    return new Promise((resolve, reject) => {
        this.downloadData(urls).then(() => {
            return resolve();
        }, (error) => {
            return reject(error);
        });
    });
}


/**
 * Downloads a video.
 * 
 * @memberof BackgroundDownloads
 * @static
 * @async
 * 
 * @param {Array<String>} urls An urls for download.
 *  
 * @returns {Promise<null>} 
 * A promise for the download that will resolve when download are successfully completed.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
BackgroundDownloads.downloadVideo = function(urls) {
    return new Promise((resolve, reject) => {
        this.downloadData(urls).then(() => {
            return resolve();
        }, (error) => {
            return reject(error);
        });
    });
}


/**
 * Downloads a data.
 * 
 * @memberof BackgroundDownloads
 * @static
 * @async
 * 
 * @param {Object} options 
 * An options for download.
 * See https://developer.chrome.com/extensions/downloads#method-download
 * 
 * @returns {Promise<Number>} 
 * A promise for the download that will resolve when download are successfully completed.
 * Resolve will contain the id of the new download item if success.
 */
BackgroundDownloads.download = function(options) {
    return new Promise((resolve, reject) => {
        chrome.downloads.download(options, (downloadId) => {
            return resolve(downloadId);
        });
    });
}


/**
 * Downloads a data of the urls.
 * 
 * @memberof BackgroundDownloads
 * @static
 * @async
 * 
 * @param {Array<String>} urls
 * The urls for download. 
 * 
 * @param {String} [fileName]
 * A name of the file. 
 * By default this is determined based on the url. 
 * If cannot be determined, then 'undefined'.
 * 
 * @param {String} [fileFormat] 
 * A format of the file. 
 * By default this is determined based on the url. 
 * If cannot be determined, then ''.
 * 
 * @param {Object} [downloadOptions] 
 * An options for download.
 * See https://developer.chrome.com/extensions/downloads#method-download
 * 
 * @returns {Promise<null>} 
 * A promise for the download that will resolve when download are successfully completed.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
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
                    }, this.downloadDelay);
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


/**
 * Determines the file name based on the url.
 * 
 * @memberof BackgroundDownloads
 * @static
 * 
 * @param {String} url
 *  
 * @returns {String} 
 * The name of the url.
 * If cannot be determined, then undefined. 
 * 
 * @example
 * // returns '123'.
 * BackgroundDownloads.determineFileName('https://2ch.hk/pr/src/987/123.jpg').
 */
BackgroundDownloads.determineFileName = function(url) {
    const lastIndex = url.lastIndexOf('.');
    const preLastIndex = url.lastIndexOf('/');

    if (lastIndex === -1 || preLastIndex === -1) {
        return undefined;
    } else {
        return url.slice(preLastIndex + 1, lastIndex);
    }
}


/**
 * Determines the file format based on the url.
 * 
 * @memberof BackgroundDownloads
 * @static
 * 
 * @param {String} url
 *  
 * @returns {String} 
 * The format of the url.
 * If cannot be determined, then undefined. 
 * 
 * @example
 * // returns '.jpg'.
 * BackgroundDownloads.determineFileName('https://2ch.hk/pr/src/987/123.jpg').
 */
BackgroundDownloads.determineFileFormat = function(url) {
    const lastIndex = url.lastIndexOf('.');

    if (lastIndex === -1) {
        return undefined;
    } else {
        return url.slice(lastIndex);   
    }
}


/**
 * Removes invalid characters from the file name.
 * 
 * @memberof BackgroundDownloads
 * @static
 * 
 * @param {String} name 
 * A file name for fix.
 * 
 * @param {String} [char=''] 
 * A char for replace. Defaults to ''. 
 *  
 * @returns {String} 
 * A valid file name.
 */
BackgroundDownloads.fixFileName = function(name, char) {
    return name.replace(/[\\\/\:\*\?\"\<\>\|]/g, char || '');
}
