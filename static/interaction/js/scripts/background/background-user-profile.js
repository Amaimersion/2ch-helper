/** 
 * The module that handles user profile operations.
 * User profile works through chrome.storage.sync.
 * 
 * @module UserProfile
 */
function UserProfile() {}


/**
 * Default profile of user. 
 * Sets when the first installation of the extension was performed.
 * 
 * @memberof UserProfile
 * @static
 * @type {Object}
 */
UserProfile.defaultProfile = {
    settings_screenshot: {
        fileNamePosts: 'posts',
        fileNameThread: 'thread',
        format: 'jpeg',
        quality: 100,
        turnOffPostsYes: true,
        turnOffPostsNo: false,
        delay: 500
    },
    
    settings_download: {
        autoDetectionName: true,
        userName: false,
        fileName: '',
        delay: 500
    },

    statistics: {
        totalSecondsSpent: 0
    }
};


/**
 * Creates user profile.
 * 
 * @memberof UserProfile
 * @static
 */
UserProfile.createProfile = function(callback) {
    callback = callback || function() {};
    chrome.storage.sync.set(this.defaultProfile, callback);
}


/**
 * Delets user profile.
 * 
 * @memberof UserProfile
 * @static
 */
UserProfile.deleteProfile = function(callback) {
    chrome.storage.sync.clear();
}


/**
 * Recreates user profile.
 * 
 * @memberof UserProfile
 * @static
 */
UserProfile.recreateProfile = function() {
    this.deleteProfile();
    this.createProfile();
}
