function BackgroundScreenshot() {}


BackgroundScreenshot.data = [];
BackgroundScreenshot.images = [];


BackgroundScreenshot.clearData = function() {
    this.data = [];
    this.images = [];
}


BackgroundScreenshot.createScreenshot = function(coordinate) {
    return new Promise((resolve, reject) => {
        const screenshotPromise = this.createTabScreenshot();

        screenshotPromise.then((uri) => {
            this.data.push({
                coordinate: coordinate, 
                uri: uri
            });

            return resolve();
        }, () => {
            this.data = [];

            const error = new Error();
            error.message = 'Failed to create screenshot.';
            
            return reject(error);
        });
    });
}


BackgroundScreenshot.createTabScreenshot = function(options) {
    options = options || {format: 'jpeg', quality: 100};

    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(options, (uri) => {
            return resolve(uri);
        });
    });
}


BackgroundScreenshot.createPostsImage = function() {
    return new Promise((resolve, reject) => {
        const createPromise = this.createObjectImage();

        createPromise.then((uri) => {
            return resolve(uri);
        }, (error) => {
            return reject(error);
        });
    });
}


BackgroundScreenshot.createThreadImage = function() {
    return new Promise((resolve, reject) => {
        const createPromise = this.createObjectImage();

        createPromise.then((uri) => {
            return resolve(uri);
        }, (error) => {
            return reject(error);
        });
    });
}


BackgroundScreenshot.createObjectImage = function() {
    return new Promise((resolve, reject) => {
        const createPromise = this.createImage();

        createPromise.then((uri) => {
            this.clearData();
            return resolve(uri);
        }, (error) => {
            this.clearData();
            return reject(error);
        });
    });
}


BackgroundScreenshot.createImage = function() {
    return new Promise((resolve, reject) => {
        const dataLoadPromise = this.createImagesOfData();

        dataLoadPromise.then(() => {
            const fullImageURI = this.createFullImageOfImages();

            return resolve(fullImageURI);
        }, () => {
            const error = new Error();
            error.message = 'Failed to create full image.';

            return reject(error);
        });
    });
}


BackgroundScreenshot.createImagesOfData = function() {
    return new Promise((resolve, reject) => {
        let promise = Promise.resolve();

        for (let data of this.data) {
            promise = promise.then(() => {
                return new Promise((res, rej) => {
                    const loadPromise = this.loadImage(data.uri);

                    loadPromise.then((image) => {
                        const coordinate = data.coordinate;

                        if (coordinate.constructor === Array) {
                            const handlerPromise = this.arrayHandler(
                                image,
                                coordinate
                            );

                            handlerPromise.then(() => {
                                return res();
                            });
                        } else {
                            const handlerPromise = this.singleHandler(
                                image,
                                coordinate
                            );

                            handlerPromise.then(() => {
                                return res();
                            });
                        }
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
                    });
                });
            });
        }

        handlePromise.then(() => {
            return resolve();
        });
    });
}


BackgroundScreenshot.singleHandler = function(image, coordinate) {
    return new Promise((resolve, reject) => {
        const cropPromise = this.cropImage(
            image, 
            coordinate
        );

        cropPromise.then((image) => {
            this.images.push(image);
            return resolve();
        });
    });
}


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

    const url = canvas.toDataURL('image/jpeg', 1);

    return url;
}


BackgroundScreenshot.cropImage = function(image, coordinate) {
    return new Promise((resolve, reject) => {
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

        const url = canvas.toDataURL('image/jpeg', 1);
        const loadPromise = this.loadImage(url);
        
        loadPromise.then((image) => {
            return resolve(image);
        })
    });
}


BackgroundScreenshot.loadImage = function(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = src;
        image.onload = function() {
            return resolve(this);
        };
    });
}
