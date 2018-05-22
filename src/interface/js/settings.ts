import {DOMLoaded} from "@modules/DOM";


interface IframeData {
    iframeId: string;
    navbarId: string;
    height: string;
}


abstract class PageInfo {
    public static iframeData: IframeData[] = [
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
}


abstract class Settings {
    public static main(): void {
        this.bindEvents();
    }

    public static bindEvents(): void {
        for (let iframeData of PageInfo.iframeData) {
            const iframeId = iframeData.iframeId;
            const navbarId = iframeData.navbarId;
            const height = iframeData.height;

            const navbar = document.getElementById(navbarId);

            if (!navbar) {
                console.error(`Could not find a navbar with the id - "${navbarId}".`);
                continue;
            }

            navbar.addEventListener("click", () => {
                this.iframeClickEvent({iframeId, navbarId, height});
            });
        }
    }

    public static iframeClickEvent(iframeData: IframeData): void {
        const iframeId = iframeData.iframeId;
        const navbarId = iframeData.navbarId;
        const height = iframeData.height;

        this.disableAllIframes();

        const navbar = document.getElementById(navbarId);
        const iframe = <HTMLIFrameElement>document.getElementById(iframeId);

        if (!navbar) {
            console.error(`Could not find a navbar with the id - "${navbarId}".`);
            return;
        }

        if (!iframe) {
            console.error(`Could not find an iframe with the id - "${iframeId}".`);
            return;
        }

        navbar.classList.add("custom-border-bottom");
        iframe.style.display = "block";
        iframe.style.height = height;
    }

    public static disableAllIframes(): void {
        for (let iframeData of PageInfo.iframeData) {
            const iframeId = iframeData.iframeId;
            const navbarId = iframeData.navbarId;

            const navbar = document.getElementById(navbarId);
            const iframe = <HTMLIFrameElement>document.getElementById(iframeId);

            if (!navbar) {
                console.error(`Could not find a navbar with the id - "${navbarId}".`);
                continue;
            }

            if (!iframe) {
                console.error(`Could not find an iframe with the id - "${iframeId}".`);
                continue;
            }

            navbar.classList.remove("custom-border-bottom");
            iframe.style.display = "none";
        }
    }
}


DOMLoaded.runFunction(() => Settings.main());
