/** 
 * The module that handles screenshot requests.
 * 
 * @module ContentScreenshot
 */
function ContentScreenshot() {}


/**
 * Options of a page.
 * 
 * @memberof ContentScreenshot
 * @static
 * @type {Object}
 */
ContentScreenshot.pageOptions = {};


/**
 * Delay for screenshoting.
 * 
 * @memberof ContentScreenshot
 * @static
 * @type {Number}
 */
ContentScreenshot.screenshotDelay = (
    ContentAPI.userSettings.settings_screenshot.delay || 500
);


/**
 * Delay to limit the time a screenshot is taken.
 * 
 * @memberof ContentScreenshot
 * @static
 * @type {Number}
 */
ContentScreenshot.errorDelay = ContentScreenshot.screenshotDelay * 10;


/**
 * Coordinate of an element on a page.
 * 
 * @memberof ContentScreenshot
 * @static
 * @constructor
 * 
 * @param {Number} [scrollX=0] 
 * @param {Number} [scrollY=0]
 * @param {Number} [width=0] 
 * @param {Number} [height=0] 
 * @param {Number} [offsetTop=0] 
 */
ContentScreenshot.Coordinate = function(scrollX, scrollY, width, height, offsetTop) {
    this.scrollX = scrollX || 0;
    this.scrollY = scrollY || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.offsetTop = offsetTop || 0;
}


/**
 * Sorts coordinates.
 * 
 * @memberof ContentScreenshot
 * @static
 * 
 * @param {Array<ContentScreenshot.Coordinate>} coordinates 
 * A coordiantes for sorting.
 * 
 * @param {String} property 
 * A property for sorting.
 */
ContentScreenshot.sortCoordinates = function(coordinates, property) {
    coordinates.sort((a, b) => {
        return a[property] - b[property];
    });
}


/**
 * Creates screenshot of selected posts.
 * 
 * @memberof ContentScreenshot
 * @static
 * @async
 * 
 * @throws {Error} Throws an error if occurs.
 */
ContentScreenshot.createScreenshotOfPosts = async function() {
    const thread = ContentAPI.getThread();

    this.setPageOptions(thread);
    this.changePageOptions(thread);

    const coordinates = this.getScrenshotCoordinates(thread);

    if (!coordinates.length) {
        alert('Не выбраны посты.');
    }

    try {
        await this.handleScreenshotCoordinates(coordinates);
    } catch (error) {
        alert('Ошибка: не удалось обработать координаты.');
        this.restorePageOptions(thread);
        throw error;
    }

    ContentAPI.sendMessageToBackground({
        type: 'command',
        command: 'createPostsImage'
    }, (response) => {
        if (!response.status) {
            alert('Ошибка: не удалось создать полное изображение.');
        }
    });

    this.restorePageOptions(thread);

    if (ContentAPI.userSettings.settings_screenshot.turnOffPostsYes) {
        ContentPageElements.turnOffPosts();
    }
}


/**
 * Gets coordinates of selected posts.
 * 
 * @memberof ContentScreenshot
 * @static
 * 
 * @returns {Array<ContentScreenshot.Coordinate>}
 * An array of sorted (by 'offsetTop') coordinates of selected posts.
 */
ContentScreenshot.getScrenshotCoordinates = function() {
    const postCoordinates = [];

    for (let post of ContentPageElements.activePosts) {
        const coordinate = new this.Coordinate(
            post.offsetLeft,
            post.offsetTop,
            post.offsetWidth,
            post.offsetHeight,
            // it's will change later.
            post.offsetTop
        );

        postCoordinates.push(coordinate);
    }

    this.sortCoordinates(postCoordinates, 'offsetTop');

    return postCoordinates;
}


/**
 * Groups and sends to background script the coordinates.
 * 
 * @memberof ContentScreenshot
 * @static
 * @async
 * 
 * @param {Array<ContentScreenshot.Coordinate>} coordinates 
 * A coordinates for handling.
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the handle that will resolve when all cordinates
 * will be grouped and sended to background script.
 * Resolve will contain nothing if success, 
 * otherwise reject will contain an error.
 */
ContentScreenshot.handleScreenshotCoordinates = function(coordinates) {
    return new Promise((resolve, reject) => {
        const innerHeight = window.innerHeight;
        let promise = Promise.resolve();
        let visibleCoordinates = [];

        for (let coordinate of coordinates) {
            promise = promise.then(() => {
                return new Promise((res, rej) => {
                    const scrollY = window.scrollY;
                    const totalOffset = coordinate.offsetTop + coordinate.height;

                    if (
                        (scrollY <= coordinate.offsetTop) && 
                        (totalOffset <= scrollY + innerHeight)
                    ) {
                        coordinate.offsetTop -= scrollY;
                        visibleCoordinates.push(coordinate); 

                        return res();
                    } else {
                        if (!visibleCoordinates.length) {
                            window.scrollTo(
                                coordinate.scrollX, 
                                coordinate.scrollY
                            );

                            coordinate.offsetTop = 0;
                            visibleCoordinates.push(coordinate);
                            
                            return res();
                        }

                        const errorOccurrence = window.setTimeout(() => {
                            const error = new Error();
                            error.message = 'Timeout limit.';

                            return rej(error);
                        }, this.errorDelay);

                        window.setTimeout(() => {
                            ContentAPI.sendMessageToBackground({
                                type: 'command',
                                command: 'createScreenshot',
                                coordinate: visibleCoordinates
                            }, (response) => {
                                if (response.status) {
                                    window.clearTimeout(errorOccurrence);
                                    window.scrollTo(
                                        coordinate.scrollX, 
                                        coordinate.scrollY
                                    );

                                    visibleCoordinates = [];
                                    coordinate.offsetTop = 0;
                                    visibleCoordinates.push(coordinate);

                                    return res();
                                } else {
                                    window.clearTimeout(errorOccurrence);
                                    return rej();
                                }
                            });
                        }, this.screenshotDelay);
                    }
                });
            });
        }

        // unsent coordinates.
        promise = promise.then(() => {
            return new Promise((res, rej) => {
                if (!visibleCoordinates.length) {
                    return res();
                }

                const errorOccurrence = window.setTimeout(() => {
                    const error = new Error();
                    error.message = 'Timeout limit.';

                    return rej(error);
                }, this.errorDelay);

                window.setTimeout(() => {
                    ContentAPI.sendMessageToBackground({
                        type: 'command',
                        command: 'createScreenshot',
                        coordinate: visibleCoordinates
                    }, (response) => {
                        if (response.status) {
                            return res();
                        } else {
                            window.clearTimeout(errorOccurrence);
                            return rej();
                        }
                    });
                }, this.screenshotDelay);
            });
        });

        promise.then(() => {
            return resolve();
        }, (rejectError) => {
            const error = new Error();
            error.message = 'Failed to create posts screenshot.';

            if (rejectError.message) {
                error.message += ' ' + rejectError.message;
            }

            return reject(error);
        });
    });
}


/*
 * This method will work fully, if handle a thread like all selected posts.
 * However, this method works faster and consumes less memory.
 */

/**
 * Creates screenshot of thread.
 * 
 * @memberof ContentScreenshot
 * @static
 * @async
 * 
 * @throws {Error} Throws an error if occurs.
 */
ContentScreenshot.createScreenshotOfThread = async function() {
    const thread = ContentAPI.getThread();

    this.setPageOptions(thread);
    this.changePageOptions(thread);

    const coordinates = this.getThreadCoordinates(thread);

    if (!coordinates.length) {
        alert('Ошибка: не удалось получить координаты треда.');
    }

    try {
        await this.handleThreadCoordinates(coordinates);
    } catch (error) {
        alert('Ошибка: не удалось обработать координаты.');
        this.restorePageOptions(thread);
        throw error;
    }
    
    this.restorePageOptions(thread);
    ContentAPI.sendMessageToBackground({
        type: 'command',
        command: 'createThreadImage'
    }, (response) => {
        if (!response.status) {
            alert('Ошибка: не удалось создать полное изображение.');
        }
    });
}


/**
 * Gets coordinates of thread.
 * 
 * @memberof ContentScreenshot
 * @static
 * 
 * @returns {Array<ContentScreenshot.Coordinate>}
 * An array of coordinates of a thread.
 */
ContentScreenshot.getThreadCoordinates = function(thread) {
    const coordinates = [];

    const windowHeight = window.innerHeight;
    const threadHeight = thread.offsetHeight;
    const threadWidth = thread.offsetWidth;
    const threadLeft = thread.offsetLeft;
    const threadTop = thread.offsetTop;
    
    let currentHeight = 0;

    // if a thread can be scrolled.
    while (currentHeight + windowHeight <= threadHeight) {
        const coordinate = new this.Coordinate(
            threadLeft,
            currentHeight + threadTop,
            threadWidth,
            windowHeight,
            0
        );

        currentHeight += windowHeight;
        coordinates.push(coordinate);
    }

    // if a thread was scrolled.
    if (coordinates.length) {
        const remainderHeight = threadHeight - currentHeight;

        const coordinate = new this.Coordinate(
            threadLeft,
            currentHeight + threadTop - windowHeight + remainderHeight,
            threadWidth,
            threadHeight - currentHeight,
            windowHeight - remainderHeight
        );

        coordinates.push(coordinate);
    // if wasn't.
    } else {
        const documentHeight = document.body.clientHeight;
        const visibleZone = documentHeight - threadTop;

        const coordinate = new this.Coordinate(
            threadLeft,
            threadTop,
            threadWidth,
            threadHeight,
            (visibleZone < windowHeight) ? (windowHeight - visibleZone) : (0)
        );

        coordinates.push(coordinate);
    }

    return coordinates;
}


/**
 * Sends to background script the coordinates.
 * 
 * @memberof ContentScreenshot
 * @static
 * @async
 * 
 * @param {Array<ContentScreenshot.Coordinate>} coordinates 
 * A coordinates for handling.
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the handle that will resolve when 
 * all cordinates will be sended to background script.
 * Resolve will contain nothing if success, 
 * otherwise reject will contain an error.
 */
ContentScreenshot.handleThreadCoordinates = function(coordinates) {
    return new Promise((resolve, reject) => {
        let promise = Promise.resolve();

        for (let coordinate of coordinates) {
            promise = promise.then(() => {
                return new Promise((res, rej) => {
                    const errorOccurrence = window.setTimeout(() => {
                        const error = new Error();
                        error.message = 'Timeout limit.';

                        return rej(error);
                    }, this.errorDelay);

                    window.scrollTo(
                        coordinate.scrollX, 
                        coordinate.scrollY
                    );

                    window.setTimeout(() => {
                        ContentAPI.sendMessageToBackground({
                            type: 'command',
                            command: 'createScreenshot',
                            coordinate: coordinate
                        }, (response) => {
                            if (response.status) {
                                window.clearTimeout(errorOccurrence);
                                return res();
                            } else {
                                window.clearTimeout(errorOccurrence);
                                return rej();
                            }
                        });
                    }, this.screenshotDelay);
                });
            });
        }

        promise.then(() => {
            return resolve();
        }, (rejectError) => {
            const error = new Error();
            error.message = 'Failed to create thread screenshot.';

            if (rejectError.message) {
                error.message += ' ' + rejectError.message;
            }

            return reject(error);
        });
    });
}


/**
 * Gets a default page options.
 * Options will be setted to ContentScreenshot.pageOptions.
 * 
 * @memberof ContentScreenshot
 * @static
 * 
 * @param {HTMLElement} thread A thread on a page. 
 */
ContentScreenshot.setPageOptions = function(thread) {
    const upNavArrow = document.getElementById('up-nav-arrow');
    const downNavArrow = document.getElementById('down-nav-arrow');
    const favoritesBox = document.getElementById('favorites-box');
    const boardstatsBox = document.getElementById('boardstats-box');
    const spoiler = thread.querySelector('.spoiler');

    this.pageOptions = {
        'documentOverflowStyle': document.documentElement.style.overflow,
        'bodyOverflowStyleY': document.body.style.overflowY,
        'scrollX': window.pageXOffset,
        'scrollY': window.pageYOffset,
        'upNavArrow': (upNavArrow) ? (upNavArrow.style.opacity || '1') : (undefined),
        'downNavArrow': (downNavArrow) ? (downNavArrow.style.opacity || '1') : (undefined),
        'favoritesBox': (favoritesBox) ? (favoritesBox.style.display) : (undefined),
        'boardstatsBox': (boardstatsBox) ? (boardstatsBox.style.display) : (undefined),
        'spoilerColor': (spoiler) ? (spoiler.style.color) : (undefined)
    };
}


 /**
 * Changes a page options on the options needed for screenshot.
 * 
 * @memberof ContentScreenshot
 * @static
 * 
 * @param {HTMLElement} thread A thread on a page. 
 */
ContentScreenshot.changePageOptions = function(thread) {
    // Try to make pages with bad scrolling work, e.g., ones with
    // body {overflow-y: scroll;} can break window.scrollTo.
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflowY = 'visible';

    // disable elements.
    const upNavArrow = document.getElementById('up-nav-arrow');
    const downNavArrow = document.getElementById('down-nav-arrow');
    const favoritesBox = document.getElementById('favorites-box');
    const boardstatsBox = document.getElementById('boardstats-box');

    (upNavArrow) ? (upNavArrow.style.opacity = '0') : (null);
    (downNavArrow) ? (downNavArrow.style.opacity = '0') : (null);
    (favoritesBox) ? (favoritesBox.style.display = 'none') : (null);
    (boardstatsBox) ? (boardstatsBox.style.display = 'none') : (null);
    
    // do all posts with spoilers visible.
    const spoilers = thread.querySelectorAll('.spoiler');

    if (spoilers) {
        for (let spoiler of spoilers) {
            spoiler.style.color = 'inherit';
        }
    }
}


/**
 * Restores default page options.
 * Options will be taken from ContentScreenshot.pageOptions.
 * 
 * @memberof ContentScreenshot
 * @static
 * 
 * @param {HTMLElement} thread A thread on a page. 
 */
ContentScreenshot.restorePageOptions = function(thread) {
    const options = this.pageOptions;

    document.documentElement.style.overflow = (
        options.documentOverflowStyle
    );

    document.body.style.overflowY = (
        options.bodyOverflowStyleY
    );

    window.scrollTo(
        options.scrollX, 
        options.scrollY
    );

    const upNavArrow = document.getElementById('up-nav-arrow');
    const downNavArrow = document.getElementById('down-nav-arrow');
    const favoritesBox = document.getElementById('favorites-box');
    const boardstatsBox = document.getElementById('boardstats-box');

    (upNavArrow) ? (upNavArrow.style.opacity = options.upNavArrow) : (null);
    (downNavArrow) ? (downNavArrow.style.opacity = options.downNavArrow) : (null);
    (favoritesBox) ? (favoritesBox.style.display = options.favoritesBox) : (null);
    (boardstatsBox) ? (boardstatsBox.style.display = options.boardstatsBox) : (null);

    const spoilers = thread.querySelectorAll('.spoiler');

    if (spoilers) {
        for (let spoiler of spoilers) {
            spoiler.style.color = options.spoilerColor;
        }
    }
}
