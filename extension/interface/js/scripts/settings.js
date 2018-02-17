function Settings() {}


Settings.iframeData = [
    {
        navbarId: 'settings-screenshot-navbar',
        elementId: 'settings-screenshot',
        height: '470px'
    },
    {
        navbarId: 'settings-download-navbar',
        elementId: 'settings-download',
        height: '250px'
    }
];


Settings.main = function() {
    Settings.bindElements();
}


Settings.bindElements = function() {
    for (let element of Settings.iframeData) {
        document.getElementById(element.navbarId).onclick = function() {
            Settings.hideAllIframes();

            const iframe = document.getElementById(element.elementId);
            
            iframe.style.display = 'block';
            iframe.style.height = element.height;
        }
    }
}

Settings.hideAllIframes = function() {
    const iframes = document.querySelectorAll('iframe');

    for (let iframe of iframes) {
        iframe.style.display = 'none';
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Settings.main);
} else {
    Settings.main();
}
