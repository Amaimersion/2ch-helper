/**
 * Script for settings.html.
 * 
 * @module Settings
 */
function Settings() {}


/** 
 * Iframes on the page.
 * 
 * @memberof Settings
 * @static
 * @type {Array<Object>}
 */
Settings.iframeData = [
    {
        navbarId: 'settings-screenshot-navbar',
        iframeId: 'settings-screenshot',
        height: '524px'
    },
    {
        navbarId: 'settings-download-navbar',
        iframeId: 'settings-download',
        height: '250px'
    }
];


/**
 * Starts when the page has the status 'DOMContentLoaded'.
 * 
 * @memberof Settings
 * @static
 */
Settings.main = function() {
    Settings.bindEvents();
}


/**
 * Binds onclick events.
 * Elements data are taken from Settings.iframeData.
 * 
 * @memberof Settings
 * @static
 */
Settings.bindEvents = function() {
    for (let iframeData of Settings.iframeData) {
        document.getElementById(iframeData.navbarId).onclick = function() {
            Settings.iframeClickEvent(iframeData.navbarId, iframeData.iframeId, iframeData.height)
        };
    }
}


/**
 * Disables all iframes.
 * Elements data are taken from Settings.iframeData.
 * 
 * @memberof Settings
 * @static
 */
Settings.disableAllIframes = function() {
    for (let iframeData of Settings.iframeData) {
        const navbar = document.getElementById(iframeData.navbarId);
        const iframe = document.getElementById(iframeData.iframeId);

        navbar.classList.remove('custom-border-bottom');
        iframe.style.display = 'none';
    }
}


/**
 * Click event for an iframe.
 * 
 * @memberof Settings
 * @static
 * 
 * @param {String} navbarId An id of navbar of the iframe.
 * @param {String} iframeId An id of the iframe.
 * @param {String} iframeHeight A height of the iframe.
 */
Settings.iframeClickEvent = function(navbarId, iframeId, iframeHeight) {
    Settings.disableAllIframes();

    const navbar = document.getElementById(navbarId);
    const iframe = document.getElementById(iframeId);
    
    navbar.classList.add('custom-border-bottom');
    iframe.style.display = 'block';
    iframe.style.height = iframeHeight;
}


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Settings.main);
} else {
    Settings.main();
}
