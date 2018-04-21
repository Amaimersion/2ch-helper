interface IframeData {
    iframeId: string;
    navbarId: string;
    height: string;
}


class Settings {
    static iframeData: IframeData[] = [
        {
            iframeId: "settings-screenshot",
            navbarId: "settings-screenshot-navbar",
            height: "524px"
        },
        {
            iframeId: "settings-download",
            navbarId: "settings-download-navbar",
            height: "250px"
        }
    ];

    static main(): void {
        Settings.bindEvents();
    }

    static bindEvents(): void {
        for (let iframeData of Settings.iframeData) {
            const iframeId = iframeData.iframeId;
            const navbarId = iframeData.navbarId;
            const height = iframeData.height;

            document.getElementById(navbarId).onclick = () => {
                Settings.iframeClickEvent({iframeId, navbarId, height});
            };
        }
    }

    static disableAllIframes(): void {
        for (let iframeData of Settings.iframeData) {
            const navbar = document.getElementById(iframeData.navbarId);
            const iframe = document.getElementById(iframeData.iframeId);

            navbar.classList.remove("custom-border-bottom");
            iframe.style.display = "none";
        }
    }

    static iframeClickEvent(iframeData: IframeData): void {
        Settings.disableAllIframes();

        const navbar = document.getElementById(iframeData.navbarId);
        const iframe = document.getElementById(iframeData.iframeId);

        navbar.classList.add("custom-border-bottom");
        iframe.style.display = "block";
        iframe.style.height = iframeData.height;
    }
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", Settings.main);
} else {
    Settings.main();
}
