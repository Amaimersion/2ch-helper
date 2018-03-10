/** 
 * A module for work with statistics.
 * 
 * @module ContentStatistics
 */
function ContentStatistics() {}


/**
 * A time when the page got focus.
 * A number is represented in milliseconds elapsed between 
 * 1 January 1970 00:00:00 UTC and the current date.
 * 
 * @memberof ContentStatistics
 * @static
 * @type {Number}
 */
ContentStatistics.focusOnTime = 0;


/**
 * A time when the page lost focus.
 * A number is represented in milliseconds elapsed between 
 * 1 January 1970 00:00:00 UTC and the current date.
 * 
 * @memberof ContentStatistics
 * @static
 * @type {Number}
 */
ContentStatistics.focusOffTime = 0;


/**
 * An event when the page was opened.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.pageOpened = function() {
    if (document.hasFocus()) {
        ContentStatistics.pageGotFocus();
    }

    ContentStatistics.bindEvents();
}


/**
 * An event when the page was closed.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.pageClosed = function() {
    if (ContentStatistics.focusOnTime) {
        ContentStatistics.pageLostFocus();
    }
}


/**
 * An event when the page got focus.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.pageGotFocus = function() {
    ContentStatistics.focusOnTime = new Date().getTime();
}


/**
 * An event when the page lost focus.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.pageLostFocus = function() {
    ContentStatistics.focusOffTime = new Date().getTime();

    ContentAPI.sendMessageToBackground({
        type: 'command',
        command: 'updateStatistics',
        field: 'totalSecondsSpent',
        data: {
            focusOnTime: ContentStatistics.focusOnTime,
            focusOffTime: ContentStatistics.focusOffTime
        }
    });

    // if focusOnTime not equal to zero,
    // then when the page will be closed
    // pageLostFocus event will be called.
    ContentStatistics.focusOnTime = 0;
    ContentStatistics.focusOffTime = 0;
}


/**
 * Binds an events to the page.
 * 
 * @memberof ContentStatistics
 * @static
 */
ContentStatistics.bindEvents = function() {
    window.addEventListener('beforeunload', this.pageClosed);
    window.addEventListener('focus', this.pageGotFocus);
    window.addEventListener('blur', this.pageLostFocus);
}


/** 
 * Adds events listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContentStatistics.pageOpened);
} else {
    ContentStatistics.pageOpened();
}
