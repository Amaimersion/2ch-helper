import {DOMLoaded} from "@modules/dom";


interface IframeNavbar {
    navbarId: string;
    iframeId: string;
    isActive: boolean;
    eventType: string;
    eventMethod: (...args: any[]) => any;
}

abstract class PageInfo {
    protected static iframeNavbars: IframeNavbar[] = [
        {
            navbarId: "navbar-screenshot",
            iframeId: "iframe-screenshot",
            isActive: true,
            eventType: "click",
            eventMethod: (navbarId: string, iframeId: string) => {
                Settings.iframeNavbarClickEvent(navbarId, iframeId);
            }
        },
        {
            navbarId: "navbar-download",
            iframeId: "iframe-download",
            isActive: false,
            eventType: "click",
            eventMethod: (navbarId: string, iframeId: string) => {
                Settings.iframeNavbarClickEvent(navbarId, iframeId);
            }
        }
    ];
}

abstract class Settings extends PageInfo {
    protected static activeIframeNavbarId: string = undefined;
    protected static activeIframeId: string = undefined;

    public static main(): void {
        Settings.bindIframeNavbars(Settings.iframeNavbars);
    }

    protected static bindIframeNavbars(navbars: IframeNavbar[]): void {
        for (let navbar of navbars) {
            const navbarElement = <HTMLDivElement>document.getElementById(navbar.navbarId);
            const iframeElement = <HTMLIFrameElement>document.getElementById(navbar.iframeId);

            if (!navbarElement) {
                throw new Error(`Could not find an iframe navbar with that id - "${navbar.navbarId}".`);
            }

            if (!iframeElement) {
                throw new Error(`Could not find an iframe with that id - "${navbar.iframeId}".`);
            }

            if (navbar.isActive) {
                navbarElement.classList.add("active-custom-navbar-item");
                iframeElement.style.display = "block";
                this.activeIframeNavbarId = navbarElement.id;
                this.activeIframeId = iframeElement.id;
            } else {
                navbarElement.classList.remove("active-custom-navbar-item");
                iframeElement.style.display = "none";
            }

            navbarElement.addEventListener(navbar.eventType, () => {
                navbar.eventMethod(navbar.navbarId, navbar.iframeId);
            });
        }
    }

    public static iframeNavbarClickEvent(navbarId: string, iframeId: string): void {
        let navbarElement = <HTMLDivElement>document.getElementById(this.activeIframeNavbarId);
        let iframeElement = <HTMLIFrameElement>document.getElementById(this.activeIframeId);

        if (!navbarElement) {
            throw new Error(`Could not find an active iframe navbar with that id - "${this.activeIframeNavbarId}".`);
        }

        if (!iframeElement) {
            throw new Error(`Could not find an active iframe with that id - "${this.activeIframeId}".`);
        }

        navbarElement.classList.remove("active-custom-navbar-item");
        iframeElement.style.display = "none";

        navbarElement = <HTMLDivElement>document.getElementById(navbarId);
        iframeElement = <HTMLIFrameElement>document.getElementById(iframeId);

        if (!navbarElement) {
            throw new Error(`Could not find an iframe navbar with that id - "${navbarId}".`);
        }

        if (!iframeElement) {
            throw new Error(`Could not find an iframe with that id - "${iframeId}".`);
        }

        navbarElement.classList.add("active-custom-navbar-item");
        iframeElement.style.display = "block";

        this.activeIframeNavbarId = navbarId;
        this.activeIframeId = iframeId;
    }
}


DOMLoaded.run(() => Settings.main());
