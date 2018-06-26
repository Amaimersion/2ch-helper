import {Script} from "@modules/communication";
import {API} from "@modules/api";
import {ScreenshotKey} from "@modules/storage-sync";
import {Elements, PageElements} from "./page-elements";


//#region Common

interface Coordinate {
    top: number;
    bottom: number;
    height: number;
    width: number;
    left: number;
    right: number;
}

abstract class CommonScreenshot {
    public static async scrollTo(x: number, y: number): Promise<void> {
        window.scrollTo(x, y);
        await API.createTimeout(250); // animation are delayed.
    }

    public static async captureCoordinates<T>(coordinates: T[], settingKey: ScreenshotKey): Promise<T[]> {
        if (!coordinates.length) {
            return coordinates;
        }

        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "screenshotCaptureCoordinates",
            data: {
                coordinates: coordinates,
                settingKey: settingKey
            }
        });

        if (API.isErrorResponse(response)) {
            throw new Error(
                "Background script cannot capture coordinates. " +
                `${response.errorText ? response.errorText : ""}`
            );
        }

        coordinates = [];

        return coordinates;
    }

    public static async end(settingKey: ScreenshotKey): Promise<void> {
        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "screenshotCreateFullImage",
            data: settingKey
        });

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || "Background script cannot create a full image.");
        }
    }
}

//#endregion


//#region Posts Screenshot

abstract class PostsScreenshot {
    public static async start(): Promise<void> {
        if (!PageElements.activePosts || !PageElements.activePosts.size) {
            console.warn("There are no active posts.");
            return;
        }

        const coordinates = this.getCoordinates(PageElements.activePosts);
        const initialScrollY = window.scrollY;
        let visibleCoordinates: Coordinate[] = [];

        for (let coordinate of coordinates) {
            if (!this.isInSight(coordinate, initialScrollY)) {
                visibleCoordinates = await CommonScreenshot.captureCoordinates(visibleCoordinates, "posts");
                await CommonScreenshot.scrollTo(0, coordinate.top + initialScrollY);
            }

            coordinate = this.normalizeCoordinate(coordinate, initialScrollY, window.scrollY);
            visibleCoordinates.push(coordinate);
        }

        visibleCoordinates = await CommonScreenshot.captureCoordinates(visibleCoordinates, "posts");
    }

    protected static getCoordinates(posts: Set<Elements.Post> | Array<Elements.Post>): Coordinate[] {
        const coordinates: Coordinate[] = [];

        for (let post of posts) {
            const postCoordinate = post.getBoundingClientRect();
            const coordinate: Coordinate = { // from readonly DOMRect to variable.
                top: postCoordinate.top, // can be changed later.
                bottom: postCoordinate.bottom, // can be changed later.
                height: postCoordinate.height,
                width: postCoordinate.width,
                left: postCoordinate.left,
                right: postCoordinate.right
            };
            coordinates.push(coordinate);
        }

        coordinates.sort((a, b) => {
            return a.top - b.top;
        });

        return coordinates;
    }

    protected static normalizeCoordinate(coordinate: Coordinate, initialScrollY: number, currentScrollY: number): Coordinate {
        if (initialScrollY === currentScrollY) {
            return coordinate;
        }

        const newCoordinate: Coordinate = {
            top: coordinate.top + initialScrollY - currentScrollY,
            bottom: undefined,
            height: coordinate.height,
            width: coordinate.width,
            left: coordinate.left,
            right: coordinate.right
        };
        newCoordinate.bottom = newCoordinate.top + newCoordinate.height;

        return newCoordinate;
    }

    protected static isInSight(coordinate: Coordinate, initialScrollY: number): boolean {
        const normalizedCoordinate = this.normalizeCoordinate(coordinate, initialScrollY, window.scrollY);
        return ((normalizedCoordinate.top >= 0) && (normalizedCoordinate.bottom <= window.innerHeight));
    }
}

//#endregion


//#region Thread Screenshot

abstract class ThreadScreenshot {
    public static async start(): Promise<void> {
        let threadCoordinate = PageElements.thread.getBoundingClientRect();
        let offsetTop: number = undefined;

        if (this.threadIsInSight(threadCoordinate)) {
            offsetTop = threadCoordinate.top;
        } else {
            await CommonScreenshot.scrollTo(0, threadCoordinate.top + window.scrollY);
            offsetTop = 0;
            threadCoordinate = PageElements.thread.getBoundingClientRect();
        }

        let remainedHeight = threadCoordinate.height;
        let capturedHeight = 0;

        while (capturedHeight < threadCoordinate.height) {
            const currentCoordinate: Coordinate = {
                top: offsetTop,
                // if a thread should be scrolled.
                bottom: threadCoordinate.bottom < window.innerHeight ? threadCoordinate.bottom : window.innerHeight,
                height: undefined,
                width: threadCoordinate.width,
                left: threadCoordinate.left,
                right: threadCoordinate.right
            };
            currentCoordinate.height = currentCoordinate.bottom - currentCoordinate.top;

            await CommonScreenshot.captureCoordinates([currentCoordinate], "thread");

            capturedHeight += currentCoordinate.height;
            remainedHeight = threadCoordinate.height - capturedHeight;

            if (capturedHeight < threadCoordinate.height) {
                if (remainedHeight >= window.innerHeight) {
                    await CommonScreenshot.scrollTo(0, window.scrollY + window.innerHeight);
                    offsetTop = 0;
                } else {
                    await CommonScreenshot.scrollTo(0, window.scrollY + remainedHeight);
                    offsetTop = window.innerHeight - remainedHeight;
                }
            }
        }
    }

    protected static threadIsInSight(coordinate: ClientRect | DOMRect): boolean {
        return ((coordinate.top >= 0) && (coordinate.top <= window.innerHeight));
    }
}

//#endregion


//#region Page Options

interface ElementsInstances {
    upNavArrow: HTMLDivElement;
    downNavArrow: HTMLDivElement;
    boardStatsBox: HTMLDivElement;
    favoritesBox: HTMLDivElement;
    autorefresh: HTMLInputElement;
    postPanelInstance: HTMLElement;
    checkboxInstance: HTMLElement;
    spoilerInstance: HTMLElement;
}

interface DefaultOptions {
    scrollX: number;
    scrollY: number;
    autorefreshChecked: boolean;
    documentOverflow: string;
    bodyOverflowY: string;
    upNavArrowOpacity: string;
    downNavArrowOpacity: string;
    favoritesBoxDisplay: string;
    boardStatsBoxDisplay: string;
    postPanelDisplay: string;
    checkboxDisplay: string;
    spoilerColor: string;
}

export abstract class PageOptions {
    public static readonly selectors = {
        upNavArrow: "#up-nav-arrow",
        downNavArrow: "#down-nav-arrow",
        boardStatsBox: "#boardstats-box",
        favoritesBox: "#favorites-box",
        autorefresh: "#autorefresh-checkbox-bot",
        postPanel: ".postpanel",
        checkbox: `.post-details > input[type="checkbox"]`,
        spoiler: ".spoiler"
    };
    protected static _elements: ElementsInstances = undefined;
    protected static _defaults: DefaultOptions = undefined;

    public static main(): void {
        this._elements = {
            upNavArrow: this.getElement(this.selectors.upNavArrow) as HTMLDivElement,
            downNavArrow: this.getElement(this.selectors.downNavArrow) as HTMLDivElement,
            boardStatsBox: this.getElement(this.selectors.boardStatsBox) as HTMLDivElement,
            favoritesBox: this.getElement(this.selectors.favoritesBox) as HTMLDivElement,
            autorefresh: this.getElement(this.selectors.autorefresh) as HTMLInputElement,
            postPanelInstance: this.getElement(this.selectors.postPanel),
            checkboxInstance: this.getElement(this.selectors.checkbox),
            spoilerInstance: this.getElement(this.selectors.spoiler)
        };
    }

    public static getDefaults(): void {
        if (!this._elements) {
            this.main();
        }

        this._defaults = {
            scrollX: window.pageXOffset,
            scrollY: window.pageYOffset,
            documentOverflow: document.documentElement.style.overflow,
            bodyOverflowY: document.body.style.overflowY,
            autorefreshChecked: this._elements.autorefresh ? this._elements.autorefresh.checked : undefined,
            upNavArrowOpacity: this._elements.upNavArrow ? this._elements.upNavArrow.style.opacity : undefined,
            downNavArrowOpacity: this._elements.downNavArrow ? this._elements.downNavArrow.style.opacity : undefined,
            favoritesBoxDisplay: this._elements.favoritesBox ? this._elements.favoritesBox.style.display : undefined,
            boardStatsBoxDisplay: this._elements.boardStatsBox ? this._elements.boardStatsBox.style.display : undefined,
            postPanelDisplay: this._elements.postPanelInstance ? this._elements.postPanelInstance.style.display : undefined,
            checkboxDisplay: this._elements.checkboxInstance ? this._elements.checkboxInstance.style.display : undefined,
            spoilerColor: this._elements.spoilerInstance ? this._elements.spoilerInstance.style.color : undefined
        };
    }

    public static change(): void {
        // Should always gets defaults, because the user
        // can change an options (e.g. scroll, autorefresh).
        this.getDefaults();

        // Trying to make pages with a bad scrolling work, e.g., ones
        // with "body {overflow-y: scroll;}" can break window.scrollTo().
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflowY = "visible";

        this._elements.autorefresh && this._defaults.autorefreshChecked ? this._elements.autorefresh.click() : null;

        // "display: none" not works.
        this._elements.upNavArrow ? this._elements.upNavArrow.style.opacity = "0" : null;
        this._elements.downNavArrow ? this._elements.downNavArrow.style.opacity = "0" : null;

        this._elements.favoritesBox ? this._elements.favoritesBox.style.display = "none" : null;
        this._elements.boardStatsBox ? this._elements.boardStatsBox.style.display = "none" : null;

        const postPanels = document.querySelectorAll<HTMLElement>(this.selectors.postPanel);
        postPanels.forEach((element) => {
            element.style.display = "none";
        });

        const checkboxes = document.querySelectorAll<HTMLElement>(this.selectors.checkbox);
        checkboxes.forEach((element) => {
            element.style.display = "none";
        });

        const spoilers = document.querySelectorAll<HTMLElement>(this.selectors.spoiler);
        spoilers.forEach((element) => {
            element.style.color = "inherit";
        });
    }

    public static restore(): void {
        document.documentElement.style.overflow = this._defaults.documentOverflow;
        document.body.style.overflowY = this._defaults.bodyOverflowY;

        this._elements.autorefresh && this._defaults.autorefreshChecked ? this._elements.autorefresh.click() : null;

        this._elements.upNavArrow ? this._elements.upNavArrow.style.opacity = this._defaults.upNavArrowOpacity : null;
        this._elements.downNavArrow ? this._elements.downNavArrow.style.opacity = this._defaults.downNavArrowOpacity : null;

        this._elements.favoritesBox ? this._elements.favoritesBox.style.display = this._defaults.favoritesBoxDisplay : null;
        this._elements.boardStatsBox ? this._elements.boardStatsBox.style.display = this._defaults.boardStatsBoxDisplay : null;

        const postPanels = document.querySelectorAll<HTMLElement>(this.selectors.postPanel);
        postPanels.forEach((element) => {
            element.style.display = this._defaults.postPanelDisplay;
        });

        const checkboxes = document.querySelectorAll<HTMLElement>(this.selectors.checkbox);
        checkboxes.forEach((element) => {
            element.style.display = this._defaults.checkboxDisplay;
        });

        const spoilers = document.querySelectorAll<HTMLElement>(this.selectors.spoiler);
        spoilers.forEach((element) => {
            element.style.color = this._defaults.spoilerColor;
        });

        // should be at the end because of postPanels and checkboxes display change.
        window.scrollTo(this._defaults.scrollX, this._defaults.scrollY);
    }

    protected static getElement(selector: string): HTMLElement {
        let element = undefined;

        try {
            element = API.getElement<HTMLElement>({selector: selector});
        } catch (error) {
            console.warn(error);
        }

        return element;
    }
}

//#endregion


//#region Screenshot

type ScreenshotMethod = (...args: any[]) => Promise<any>;

export abstract class Screenshot {
    public static posts(): Promise<void> {
        return this.run(
            () => {return PostsScreenshot.start()},
            () => {return CommonScreenshot.end("posts")}
        );
    }

    public static thread(): Promise<void> {
        return this.run(
            () => {return ThreadScreenshot.start()},
            () => {return CommonScreenshot.end("thread")}
        );
    }

    protected static async run(startMethod: ScreenshotMethod, endMethod: ScreenshotMethod): Promise<void> {
        PageOptions.change();

        // We need to wait a little bit, because turn off
        // occurres too quickly and animations are delayed.
        await API.createTimeout(100);

        try {
            await startMethod();
        } catch (error) {
            throw error;
        } finally {
            PageOptions.restore();
        }

        await endMethod();
    }
}

//#endregion
