/** 
 * The module that handles screenshot requests.
 * 
 * @module BackgroundScreenshot
 */
function BackgroundScreenshot() {}


/**
 * Data for further handling.
 * Contains object with next properties: 'coordinate', 'uri'.
 * Coordinate is position of needed region to crop.
 * Uri is image to crop.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @type {Array<Object>}
 */
BackgroundScreenshot.data = [];


/**
 * Images for further handling.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @type {Array<HTMLImageElement>}
 */
BackgroundScreenshot.images = [];


/**
 * Clears BackgroundScreenshot.data and BackgroundScreenshot.images.
 * 
 * @memberof BackgroundScreenshot
 * @static
 */
BackgroundScreenshot.clearData = function() {
    this.data = [];
    this.images = [];
}


/**
 * Creates a screenshot of current window and adds
 * coordinate and URI (screenshot) to BackgroundScreenshot.data.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @param {ContentScreenshot.Coordinate} coordinate
 * Position of needed region to crop. 
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
BackgroundScreenshot.createScreenshot = function(coordinate) {
    return new Promise(async (resolve, reject) => {
        let uri = '';

        try {
            uri = await this.createTabScreenshot();
        } catch (e) {
            this.clearData();

            const error = new Error();
            error.message = 'Failed to create screenshot.';
            
            return reject(error);
        }

        this.data.push({
            coordinate: coordinate, 
            uri: uri
        });

        return resolve();
    });
}


/**
 * Creates a screenshot of current window.
 * Screenshot will have JPEG format and 100% quality.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @param {Object} options 
 * An options for capture.
 * See https://developer.chrome.com/extensions/tabs#method-captureVisibleTab
 * 
 * @returns {Promise<String>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain uri if success.
 */
BackgroundScreenshot.createTabScreenshot = function(options) {
    return new Promise((resolve, reject) => {
        options = options || {
            format: BackgroundAPI.userSettings.settings_screenshot.format, 
            quality: BackgroundAPI.userSettings.settings_screenshot.quality
        };

        chrome.tabs.captureVisibleTab(options, (uri) => {
            return resolve(uri);
        });
    });
}


/**
 * Creates full image of posts.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @returns {Promise<String | Error>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain uri if success, otherwise reject will contain an error. 
 */
BackgroundScreenshot.createPostsImage = async function() {
    return new Promise(async (resolve, reject) => {
        let uri = '';

        try {
            uri = await this.createObjectImage();
        } catch (error) {
            return reject(error);
        }

        return resolve(uri);
    });
}


/**
 * Creates full image of thread.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @returns {Promise<String | Error>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain uri if success, otherwise reject will contain an error. 
 */
BackgroundScreenshot.createThreadImage = function() {
    return new Promise(async (resolve, reject) => {
        let uri = '';

        try {
            uri = await this.createObjectImage();
        } catch (error) {
            return reject(error);
        }

        return resolve(uri);
    });
}


/**
 * Creates full image of BackgroundScreenshot.data.
 * Template for BackgroundScreenshot.createPostsImage and 
 * BackgroundScreenshot.createThreadImage.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @returns {Promise<String | Error>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain uri if success, otherwise reject will contain an error. 
 */
BackgroundScreenshot.createObjectImage = function() {
    return new Promise(async (resolve, reject) => {
        let uri = '';

        try {
            uri = await this.createImage();
        } catch (error) {
            this.clearData();
            return reject(error);
        }

        this.clearData();

        return resolve(uri);
    });
}


/**
 * Creates full image of BackgroundScreenshot.data.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @returns {Promise<String | Error>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain uri if success, otherwise reject will contain an error. 
 */
BackgroundScreenshot.createImage = function() {
    return new Promise(async (resolve, reject) => {
        try {
            await this.createImagesOfData();
        } catch (e) {
            const error = new Error();
            error.message = 'Failed to create full image.';

            return reject(error);
        }

        const fullImageURI = this.createFullImageOfImages();

        return resolve(fullImageURI);
    });
}


/**
 * Creates crop images of BackgroundScreenshot.data.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the create that will resolve when create are successfully completed.
 * Resolve will contain nothing if success, otherwise reject will contain an error. 
 */
BackgroundScreenshot.createImagesOfData = function() {
    return new Promise((resolve, reject) => {
        let promise = Promise.resolve();

        for (let data of this.data) {
            promise = promise.then(() => {
                return new Promise((res, rej) => {
                    const loadPromise = this.loadImage(data.uri);

                    loadPromise.then((image) => {
                        const coordinate = data.coordinate;

                        // if it's a posts coordinates.
                        if (coordinate.constructor === Array) {
                            const handlerPromise = this.arrayHandler(
                                image,
                                coordinate
                            );

                            handlerPromise.then(() => {
                                return res();
                            }, () => {
                                return rej();
                            });
                        // if it's a thread coordinate.
                        } else {
                            const handlerPromise = this.singleHandler(
                                image,
                                coordinate
                            );

                            handlerPromise.then(() => {
                                return res();
                            }, () => {
                                return rej();
                            });
                        }
                    }, () => {
                        return rej();
                    });
                });
            });
        }

        promise.then(() => {
            return resolve();
        }, () => {
            const error = new Error();
            error.message = 'Failed to create data images.';

            return reject(error);
        });
    });
}


/**
 * Handles array coordinates. 
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @param {HTMLImageElement} image
 * An image to crop.
 *  
 * @param {Array<ContentScreenshot.Coordinate>} coordinates 
 * A coordinates to crop.
 * 
 * @returns {Promise<void>} 
 * A promise for the handle that will resolve when handle are successfully completed.
 * Resolve will contain nothing if success. 
 */
BackgroundScreenshot.arrayHandler = function(image, coordinates) {
    return new Promise((resolve, reject) => {
        let handlePromise = Promise.resolve();

        for (let coordinate of coordinates) {
            handlePromise = handlePromise.then(() => {
                return new Promise((res, rej) => {
                    const singlePromise = this.singleHandler(
                        image,
                        coordinate
                    );

                    singlePromise.then(() => {
                        return res();
                    }, () => {
                        return rej();
                    });
                });
            });
        }

        handlePromise.then(() => {
            return resolve();
        }, () => {
            return reject();
        });
    });
}


/**
 * Handles single coordinate. 
 * Cropped image will be added to BackgroundScreenshot.images.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @param {HTMLImageElement} image
 * An image to crop.
 *  
 * @param {ContentScreenshot.Coordinate} coordinate
 * A coordinate to crop.
 * 
 * @returns {Promise<void>} 
 * A promise for the handle that will resolve when handle are successfully completed.
 * Resolve will contain nothing if success. 
 */
BackgroundScreenshot.singleHandler = function(image, coordinate) {
    return new Promise(async (resolve, reject) => {
        let cropImage;

        try {
            cropImage = await this.cropImage(image, coordinate);
        } catch (e) {
            return reject();
        }

        this.images.push(cropImage);

        return resolve();
    });
}


/**
 * Creates full image of BackgroundScreenshot.images.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * 
 * @returns {String} URL of the full image.
 */
BackgroundScreenshot.createFullImageOfImages = function() {
    let height = 0;

    for (let image of this.images) {
        height += image.height;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = this.images[0].width;
    canvas.height = height;

    let y = 0;

    for (let image of this.images) {
        context.drawImage(image, 0, y);
        y += image.height;
    }

    const url = canvas.toDataURL(
        'image/' + BackgroundAPI.userSettings.settings_screenshot.format, 
        BackgroundAPI.userSettings.settings_screenshot.quality / 100
    );

    return url;
}


/**
 * Crops the image by coordinate.
 * Cropped image will have JPEG format and 100% quality.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @param {HTMLImageElement} image
 * An image to crop.
 *  
 * @param {ContentScreenshot.Coordinate} coordinate
 * A coordinate to crop.
 * 
 * @returns {Promise<HTMLImageElement>} 
 * A promise for the crop that will resolve when crop are successfully completed.
 * Resolve will contain cropped image if success. 
 */
BackgroundScreenshot.cropImage = function(image, coordinate) {
    return new Promise(async (resolve, reject) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = coordinate.width;
        canvas.height = coordinate.height;

        context.drawImage(
            image,
            coordinate.scrollX,
            coordinate.offsetTop,
            coordinate.width,
            coordinate.height,
            0,
            0,
            coordinate.width,
            coordinate.height  
        );

        const url = canvas.toDataURL(
            'image/' + BackgroundAPI.userSettings.settings_screenshot.format, 
            BackgroundAPI.userSettings.settings_screenshot.quality / 100
        );
        const croppedImage = await this.loadImage(url);

        return resolve(croppedImage);
    });
}


/**
 * Loads the image from src.
 * 
 * @memberof BackgroundScreenshot
 * @static
 * @async
 * 
 * @param {String} src 
 * An url for load.
 * 
 * @returns {Promise<HTMLImageElement>} 
 * A promise for the load that will resolve when load are successfully completed.
 * Resolve will contain loaded image if success. 
 */
BackgroundScreenshot.loadImage = function(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onload = function() {
            return resolve(this);
        };
    });
}
