/**
 * Script for statistics.html.
 * 
 * @module Statistics
 */
function Statistics() {}


/**
 * Starts when the page has the status 'DOMContentLoaded'.
 * 
 * @memberof Settings
 * @static
 * @async
 */
Statistics.main = async function() {
    await SettingsIframe.initUserSettings();
    Statistics.bindTime();
}


/**
 * Binds a statistics time.
 * 
 * @memberof Settings
 * @static
 */
Statistics.bindTime = function() {
    const element = document.getElementById('statistics-time');
    console.log(SettingsIframe.userSettings.statistics);
    let time = SettingsIframe.userSettings.statistics.totalSecondsSpent / 3600;
    time = Math.round(time);
    element.textContent = time;
}


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Statistics.main);
} else {
    Statistics.main();
}
