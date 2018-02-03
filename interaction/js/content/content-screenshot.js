/**
 * @file Creation of the screenshot, content script role.
 * 
 * A screenshot of active posts:
 * 1. Receives a command from the popup.
 * 2. Gets a coordinates of the active posts.
 * 3. Groups the coordinates.
 * 4. Send the coordinates and a command to the background script.
 */


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command === "createScreenshotOfPosts") {
        createScreenshotOfPosts();
    }
});


/**
 * Starts creation of the screenshot.
 */
function createScreenshotOfPosts() {
    var coordinates = getPostsCoordinates();
    sortPostsCoordinates(coordinates);

    var defaultPageOptions = getPageOptions();
    changePageOptions();
 
    sendCoordinatesAndCommand(coordinates, 0, defaultPageOptions);
}


/**
 * Groups the coordinates and send them and
 * a command for creation of the screenshot 
 * to background script.
 * 
 * @param {Object<string, number>} coordinates 
 * A coorindates of the active posts.
 * 
 * @param {Number} index
 * From which coordinates start to take a screenshot.
 *  
 * @param {Object} defaultPageOptions 
 * A default page options to recover at the end of a work.
 */
function sendCoordinatesAndCommand(coordinates, index, defaultPageOptions) {
    if (coordinates.length === index) {
        setPageOptions(defaultPageOptions);
        sendMessageToBackgroundScript({command: "createImage"});
        return;
    }

    // if within the time a response from a background script do not come, 
    // then some error happened. End the function.
    var errorOccurrence = window.setTimeout(function() {
        alert("Error");
        setPageOptions(defaultPageOptions);
        sendMessageToBackgroundScript({command: "error"});
        return;
    }, 10000);

    // if one element is selected and it is not in the visible area, 
    // then without this command the function will loop.
    window.scrollTo(coordinates[index].pageLeft, coordinates[index].pageTop);

    var status = true;
    var coordinatesInVisibleWindow = [];

    while (status && index !== coordinates.length) {
        var coordinate = coordinates[index];
        var scrollY = window.pageYOffset;
        var visibleArea = window.innerHeight + scrollY;

        coordinate.visibleAreaTop = coordinate.pageTop - scrollY;

        if ((scrollY <= coordinate.pageTop) && (coordinate.pageTop + coordinate.height <= visibleArea)) {
            coordinatesInVisibleWindow.push(coordinate);
            index++;
        } else {
            status = false;
        }
    }

    window.setTimeout(function() {
        sendMessageToBackgroundScript({
            command: "createScreenshot",
            coordinates: coordinatesInVisibleWindow
        }, function(response) {
            window.clearTimeout(errorOccurrence);
            sendCoordinatesAndCommand(coordinates, index, defaultPageOptions);
        });
    }, 500);
}


/**
 * Sends the message to the background scripts.
 * 
 * @param {Object} message
 * A message for sending.
 * 
 * @param {function(Object)} callback
 * A callback that handles the response.
 */
function sendMessageToBackgroundScript(message, callback) {
    callback = callback || function() {};

    chrome.runtime.sendMessage(message, function(response) {
        callback(response);
    });
}


/**
 * Gets a coordinates of the active posts. 
 * 
 * @returns {Object<string, number>}
 */
function getPostsCoordinates() {
    var coordinates = [];
    var i = 0;

    while (i != GLOBAL_CONTENT_ACTIVE_POSTS.length) {
        var post = GLOBAL_CONTENT_ACTIVE_POSTS[i];
        var coordinate = {
            // a distance from the top of the page.
            pageTop: 0,
            // a distance from the left of the page.
            pageLeft: 0,
            // a distance from the top of the visible area of the page.
            // it will be definitely late.
            visibleAreaTop: 0,
            // a width of a post.
            width: 0,
            // a height of a post.
            height: 0
        };

        coordinate.pageTop = post.offsetTop;
        coordinate.pageLeft = post.offsetLeft;
        coordinate.width = post.offsetWidth;
        coordinate.height = post.offsetHeight;

        coordinates.push(coordinate);
        i++;
    }

    return coordinates;
}


/**
 * Sorts the posts coordinates in ascending order.
 * Sorting based on a distance from the top of the page.
 * 
 * @param {Object<string, number>} coordinates 
 */
function sortPostsCoordinates(coordinates) {
    coordinates.sort(function(a, b) {
        return a.pageTop - b.pageTop;
    });
}


/**
 * Gets a default page options.
 * 
 * @returns {Object}
 */
function getPageOptions() {
    var defaultOptions = {};

    defaultOptions["documentOverflowStyle"] = document.documentElement.style.overflow;
    defaultOptions["bodyOverflowStyleY"] = document.body.style.overflowY;
    defaultOptions["scrollX"] = window.pageXOffset;
    defaultOptions["scrollY"] = window.pageYOffset;

    return defaultOptions;
}


/**
 * Changes a page options. 
 */
function changePageOptions() {
    // Try to make pages with bad scrolling work, e.g., ones with
    // body {overflow-y: scroll;} can break window.scrollTo.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflowY = "visible";
}


/**
 * Set the page options.
 * 
 * @param {Object} options 
 */
function setPageOptions(options) {
    document.documentElement.style.overflow = options.documentOverflowStyle;
    document.body.style.overflowY = options.bodyOverflowStyleY;
    window.scrollTo(options.scrollX, options.scrollY);
}
