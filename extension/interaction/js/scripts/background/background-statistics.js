/** 
 * The module that handles statistics requests.
 * 
 * @module BackgroundStatistics
 */
function BackgroundStatistics() {}


/**
 * A names of settings in user profile.
 * 
 * @memberof BackgroundStatistics
 * @static
 * @type {Object}
 */
BackgroundStatistics.fields = {
    main: 'statistics',
    totalSecondsSpent: 'totalSecondsSpent'
}; 


/**
 * Handles requests for statistics updates.
 * 
 * @memberof BackgroundStatistics
 * @static
 * @async
 * 
 * @param {String} field
 * A field of statistics for update.
 *  
 * @param {Object} data
 * A data for update.
 *  
 * @returns {Promise<void | Error>} 
 * A promise for the update that will resolve when the update will end.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
BackgroundStatistics.updateStatistics = function(field, data) {
    return new Promise(async (resolve, reject) => {
        if (field === 'totalSecondsSpent') {
            try {
                await this.updateTotalSecondsSpent(
                    data.loadedDate,
                    data.closedDate
                );
            } catch (error) {
                return reject(error);
            }

            return resolve();
        } else {
            const error = new Error();
            erroe.message = 'An unknown field.';

            return reject(error);
        }
    });
}


/**
 * Handles 'totalSecondsSpent' field update.
 * 
 * @memberof BackgroundStatistics
 * @static
 * @async
 * 
 * @param {Number} loadedMs
 * A time of opening the page in milliseconds. 
 * 
 * @param {Number} closedMs 
 * A time of closing the page in milliseconds. 
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the update that will resolve when the update will end.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
BackgroundStatistics.updateTotalSecondsSpent = function(loadedMs, closedMs) {
    return new Promise(async (resolve, reject) => {
        let seconds = 0;

        seconds = closedMs - loadedMs;
        seconds /= 1000;
        seconds = Math.round(seconds);

        const mainField = this.fields.main;
        const field = this.fields.totalSecondsSpent;

        seconds += BackgroundAPI.userSettings[mainField][field];

        try {
            await this.updateStatisticsField(field, seconds);
        } catch (error) {
            return reject(error);
        }

        return resolve();
    });
}


/**
 * Updates certain field of user settings.
 * 
 * @memberof BackgroundStatistics
 * @static
 * @async
 * 
 * @param {String} field
 * A field to set. 
 * 
 * @param {any} value
 * A value to set. 
 * 
 * @returns {Promise<void | Error>} 
 * A promise for the update that will resolve when the update will end.
 * Resolve will contain nothing if success, otherwise reject will contain an error.
 */
BackgroundStatistics.updateStatisticsField = function(field, value) {
    return new Promise((resolve, reject) => {
        const mainField = this.fields.main;
        const errorOccurrence = this.createErrorOccurrence(reject);
        console.log(errorOccurrence);

        BackgroundAPI.userSettings[mainField][field] = value;

        BackgroundAPI.saveUserSettings(mainField, () => {
            window.clearTimeout(errorOccurrence);
            return resolve();
        });
    });
}


/**
 * Creates timeout limit error occurrence.
 * Created to work in Promise.
 * 
 * @memberof BackgroundStatistics
 * @static
 * 
 * @param {Function} reject
 * A reject from Promise that will contain an error.
 * 
 * @param {Number} [delay=5000]
 * Through how many milliseconds will happen timeout limit.
 * Defaults to 5000. 
 * 
 * @returns {Number}
 * A positive integer value which identifies the timer.
 */
BackgroundStatistics.createErrorOccurrence = function(reject, delay) {
    delay = delay || 5000;

    return window.setTimeout(() => {
        const error = new Error();
        error.message = 'Timeout limit.';

        reject(error);
    }, delay);
}
