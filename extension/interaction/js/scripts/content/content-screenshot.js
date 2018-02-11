function ContentScreenshot() {}


ContentScreenshot.pageOptions = {};


ContentScreenshot.Coordinate = function(scrollX, scrollY, width, height, offsetTop) {
    this.scrollX = scrollX || 0;
    this.scrollY = scrollY || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.offsetTop = offsetTop || 0;
}


ContentScreenshot.sortCoordinates = function(coordinates, property) {
    coordinates.sort((a, b) => {
        return a[property] - b[property];
    });
}


ContentScreenshot.createScreenshotOfPosts = function() {
    const thread = ContentAPI.getThread();

    this.setPageOptions(thread);
    this.changePageOptions(thread);

    const coordinates = this.getScrenshotCoordinates(thread);
    const promise = this.handleScreenshotCoordinates(coordinates);
    
    promise.then(() => {
        this.restorePageOptions(thread);
        ContentAPI.sendMessageToBackground({
            type: 'command',
            command: 'createPostsImage'
        });
    }, (error) => {
        this.restorePageOptions(thread);
        throw error;
    });
}


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
                        }, 10000);

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
                        }, 500);
                    }
                });
            });
        }

        promise = promise.then(() => {
            return new Promise((res, rej) => {
                if (!visibleCoordinates.length) {
                    return res();
                }

                const errorOccurrence = window.setTimeout(() => {
                    const error = new Error();
                    error.message = 'Timeout limit.';

                    return rej(error);
                }, 10000);

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
                }, 500);
            });
        });

        promise.then(() => {
            return resolve();
        }, () => {
            const error = new Error();
            error.message = 'Failed to create posts screenshot.';

            return reject(error);
        });
    });
}


// This method will work fully, if handle (this.createScreenshotOfPosts()) 
// a thread like all selected posts.
// However, this method works faster and consumes less memory.
ContentScreenshot.createScreenshotOfThread = function() {
    const thread = ContentAPI.getThread();

    this.setPageOptions(thread);
    this.changePageOptions(thread);

    const coordinates = this.getThreadCoordinates(thread);
    const promise = this.handleThreadCoordinates(coordinates);
    
    promise.then(() => {
        this.restorePageOptions(thread);
        ContentAPI.sendMessageToBackground({
            type: 'command',
            command: 'createThreadImage'
        });
    }, (error) => {
        this.restorePageOptions(thread);
        throw error;
    });
}


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
                    }, 10000);

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
                    }, 500);
                });
            });
        }

        promise.then(() => {
            return resolve();
        }, () => {
            const error = new Error();
            error.message = 'Failed to create thread screenshot.';

            return reject(error);
        });
    });
}


/**
 * Gets a default page options.
 * 
 * @returns {Object}
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
 * Changes a page options. 
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
 * Set the page options.
 * 
 * @param {Object} options 
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
