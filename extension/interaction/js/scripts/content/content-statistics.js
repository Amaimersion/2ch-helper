/** 
 * The module that handles statistics requests.
 * 
 * @module ContentStatistics
 */
function ContentStatistics() {}


/**
 * A date of the opening page in milliseconds
 * 
 * @memberof ContentStatistics
 * @static
 * @type {Number}
 */
ContentStatistics.loadedDate = 0;


/**
 * A date of the closing page in milliseconds
 * 
 * @memberof ContentStatistics
 * @static
 * @type {Number}
 */
ContentStatistics.closedDate = 0;


/**
 * The event for 'DOMContentLoaded'.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.pageLoaded = function() {
    ContentStatistics.loadedDate = new Date().getTime();
}


/**
 * The event for 'beforeunload'.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.pageClosed = function() {
    ContentStatistics.closedDate = new Date().getTime();
    ContentAPI.sendMessageToBackground({
        type: 'command',
        command: 'updateStatistics',
        field: 'totalSecondsSpent',
        data: {
            loadedDate: ContentStatistics.loadedDate,
            closedDate: ContentStatistics.closedDate
        }
    });
}


/** 
 * Adds events listeners to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContentStatistics.pageLoaded);
} else {
    ContentStatistics.pageLoaded();
}

window.addEventListener('beforeunload', ContentStatistics.pageClosed);
