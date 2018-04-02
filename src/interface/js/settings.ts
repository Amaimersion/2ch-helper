export default class Settings {
    static iframeData: Array<{navbarId: string, iframeId: string, height: string}>;
    static main: () => void;
    static bindEvents: () => void;
    static disableAllIframes: () => void;
    static iframeClickEvent: (navbarId: string, iframeId: string, iframeHeight: string) => void;
}


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


Settings.main = function() {
    Settings.bindEvents();
}


Settings.bindEvents = function() {
    for (let iframeData of Settings.iframeData) {
        document.getElementById(iframeData.navbarId).onclick = function() {
            Settings.iframeClickEvent(iframeData.navbarId, iframeData.iframeId, iframeData.height)
        };
    }
}


Settings.disableAllIframes = function() {
    for (let iframeData of Settings.iframeData) {
        const navbar = document.getElementById(iframeData.navbarId);
        const iframe = document.getElementById(iframeData.iframeId);

        navbar.classList.remove('custom-border-bottom');
        iframe.style.display = 'none';
    }
}


Settings.iframeClickEvent = function(navbarId, iframeId, iframeHeight) {
    Settings.disableAllIframes();

    const navbar = document.getElementById(navbarId);
    const iframe = document.getElementById(iframeId);

    navbar.classList.add('custom-border-bottom');
    iframe.style.display = 'block';
    iframe.style.height = iframeHeight;
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Settings.main);
} else {
    Settings.main();
}
