/** 
 * The module that handles background events.
 * An events that gets handling: first install, DOMContentLoaded.
 * 
 * @module BackgroundEvents
 */
function BackgroundEvents() {}


/**
 * Handles DOMContentLoaded event.
 * 
 * @memberof BackgroundEvents
 * @static
 */
BackgroundEvents.DOMContentLoaded = function() {
    BackgroundAPI.getUserSettings();
}


/**
 * Handles first install event.
 * 
 * @memberof BackgroundEvents
 * @static
 */
BackgroundEvents.firstInstall = function() {
    UserProfile.createProfile(this.DOMContentLoaded); 
}


/* Sets the events. */


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', BackgroundEvents.DOMContentLoaded);
} else {
    BackgroundEvents.DOMContentLoaded();
}


chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        BackgroundEvents.firstInstall();
    }
});
