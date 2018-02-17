function UserProfile() {}


UserProfile.defaultProfile = {
    settings: {
        screenshot: {
            fileNamePosts: 'posts',
            fileNameThread: 'thread',
            format: 'jpeg',
            quality: 100,
            delay: 500
        },

        download: {
            autoDetectionName: true,
            userName: false,
            fileName: '',
            delay: 500
        }
    }
};


UserProfile.createProfile = function() {
    chrome.storage.sync.set(this.defaultProfile);
}


UserProfile.deleteProfile = function() {
    chrome.storage.sync.clear();
}


UserProfile.recreateProfile = function() {
    this.deleteProfile();
    this.createProfile();
}
