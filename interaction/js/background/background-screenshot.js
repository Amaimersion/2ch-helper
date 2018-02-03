/**
 * @file Creation of the screenshot, background script role.
 * 
 * A screenshot of active posts:
 * 1. Receives a coordinates and command from the content script.
 * 2. Creates a screenshot of visible window.
 * 3. Creates the pair: coordinates in window - screenshot of that window.
 * 4. Crop the screenshots and get a screenshot of each post.
 * 5. Creates the one full screenshot.
 */


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "createScreenshot") {
        createScreenshot(request, sendResponse);
        // enable asynchronous response.
        return true;
    } else if (request.command === "createImage") {
        createPostsImages();
    } else if (request.command === "error") {
        GLOBAL_BACKGROUND_URI = [];
        GLOBAL_BACKGROUND_IMAGES = [];
        GLOBAL_BACKGROUND_POST_COUNT = 0;
    }
});


/**
 * Creates screenshot of visible window and
 * adds a pair (coordinates - image) to the URI.
 * 
 * @param {Object} request 
 * @param {Object} sendResponse 
 */
function createScreenshot(request, sendResponse) {
    chrome.tabs.captureVisibleTab({format: "jpeg", quality: 100}, function(data) {
        GLOBAL_BACKGROUND_URI.push({coordinates: request.coordinates, image: data});
        sendResponse({status: true});
    });
}


/**
 * Creates image of each posts and adds it to the images.
 * Posts images will be in exactly the same order in which 
 * they were originally.
 */
function createPostsImages() {
    GLOBAL_BACKGROUND_POST_COUNT = getPostCount();
    var number = 0;
    var i = 0;

    while (i != GLOBAL_BACKGROUND_URI.length) {
        var j = 0;

        while (j != GLOBAL_BACKGROUND_URI[i].coordinates.length) {
            var coordinate = GLOBAL_BACKGROUND_URI[i].coordinates[j];
            var image = new Image();

            image.src = GLOBAL_BACKGROUND_URI[i].image;
            image.customProperty = {
                number: number,
                coordinateWidth: coordinate.width,
                coordinateHeight: coordinate.height,
                coordinatePageLeft: coordinate.pageLeft,
                coordinateVisibleAreaTop: coordinate.visibleAreaTop 
            };

            image.onload = function () {
                var canvas = document.createElement("canvas");
                var context = canvas.getContext("2d");
                canvas.width = this.customProperty.coordinateWidth;
                canvas.height = this.customProperty.coordinateHeight;

                context.drawImage(
                    this,
                    this.customProperty.coordinatePageLeft, 
                    this.customProperty.coordinateVisibleAreaTop,
                    this.customProperty.coordinateWidth, 
                    this.customProperty.coordinateHeight,
                    0, 
                    0,
                    this.customProperty.coordinateWidth, 
                    this.customProperty.coordinateHeight
                );

                var croppedURL = canvas.toDataURL("image/png");
                var croppedImage = new Image();

                croppedImage.src = croppedURL;
                croppedImage.customProperty = {
                    number: this.customProperty.number
                };

                croppedImage.onload = function() {
                    GLOBAL_BACKGROUND_IMAGES[this.customProperty.number] = this;

                    // all of the screenshots of a posts is collected.
                    if (this.customProperty.number === GLOBAL_BACKGROUND_POST_COUNT - 1) {
                        createImage();
                    }
                };
            }

            number++;
            j++;
        }

        i++;
    }

    GLOBAL_BACKGROUND_URI = [];
}


/**
 * Counts the number of a posts.
 * 
 * @returns {Number}
 */
function getPostCount() {
    var count = 0;
    var i = 0;

    while (i != GLOBAL_BACKGROUND_URI.length) {
        var j = 0;

        while (j != GLOBAL_BACKGROUND_URI[i].coordinates.length) {
            count++;
            j++;
        }

        i++;
    }

    return count;
}


/**
 * Creates full screenshot of the posts. 
 */
function createImage() {
    var height = 0;

    for (var i = 0; i != GLOBAL_BACKGROUND_POST_COUNT; i++)
        height += GLOBAL_BACKGROUND_IMAGES[i].height;

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    
    canvas.height = height;
    canvas.width = GLOBAL_BACKGROUND_IMAGES[0].width;

    var x = 0;
    var y = 0;

    for (var i = 0; i != GLOBAL_BACKGROUND_POST_COUNT; i++) {
        context.drawImage(GLOBAL_BACKGROUND_IMAGES[i], x, y);
        y += GLOBAL_BACKGROUND_IMAGES[i].height;
    }

    var url = canvas.toDataURL("image/png");
    chrome.tabs.create({url: url, active: false, selected: false});

    GLOBAL_BACKGROUND_IMAGES = [];
    GLOBAL_BACKGROUND_POST_COUNT = 0;
}
