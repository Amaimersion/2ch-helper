import {Script} from "@modules/communication";
import {API} from "@modules/api";
import {ScreenshotKey, UserSettings} from "@modules/storage-sync";
import {Settings} from "./settings";
import {Elements, PageElements} from "./page-elements";


//#region Common

/**
 * Coordinate of an element.
 */
interface Coordinate {
    top: number;
    bottom: number;
    height: number;
    width: number;
    left: number;
    right: number;
}

/**
 * Common methods for other screenshot modules.
 */
abstract class CommonScreenshot {
    /**
     * Scrolls to a particular set of coordinates in the document.
     *
     * @param x The pixel along the horizontal axis.
     * @param y The pixel along the vertical axis.
     *
     * @returns
     * This method creates a little timeout, because animation of the scroll are delayed.
     * You should await the `Promise`.
     */
    public static async scrollTo(x: number, y: number): Promise<void> {
        window.scrollTo(x, y);
        await API.createTimeout(250);
    }

    /**
     * Captures coordinates of the visible screen area.
     *
     * @param coordinates The coordinates for capturing.
     * @param settingKey The key of the screenshot settings.
     *
     * @returns If success, then empty coordinates will be returned.
     */
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

    /**
     * Ends screenshot capturing.
     * Sends a command to the background script to create a full image.
     *
     * @param settingKey The key of the screenshot settings.
     */
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

/**
 * Screenshot of the posts.
 */
abstract class PostsScreenshot {
    /**
     * Starts posts screenshot capturing.
     */
    public static async start(): Promise<void> {
        if (!PageElements.activePosts || !PageElements.activePosts.size) {
            throw new Error("Активные посты не найдены");
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

        // by this time visible coordinates can be not empty.
        await CommonScreenshot.captureCoordinates(visibleCoordinates, "posts");
    }

    /**
     * Gets active posts coordinates.
     *
     * @param posts The active posts.
     *
     * @returns Sorted by the top coordinates.
     */
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

    /**
     * Normalizes a coordinate.
     *
     * @param coordinate The coordinate for normalizing.
     * @param initialScrollY The initial scroll.
     * @param currentScrollY The current croll.
     *
     * @returns The coordinate relative to the current screen position.
     */
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

    /**
     * Checks if a coordinate is in the visible zone.
     *
     * @param coordinate The coordinate for checking.
     * @param initialScrollY The initial scroll.
     */
    protected static isInSight(coordinate: Coordinate, initialScrollY: number): boolean {
        const normalizedCoordinate = this.normalizeCoordinate(coordinate, initialScrollY, window.scrollY);
        return ((normalizedCoordinate.top >= 0) && (normalizedCoordinate.bottom <= window.innerHeight));
    }
}

//#endregion


//#region Thread Screenshot

/**
 * Screenshot of the thread.
 */
abstract class ThreadScreenshot {
    /**
     * Starts thread screenshot capturing.
     */
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

    /**
     * Checks if a thread is in the visible area.
     *
     * @param coordinate The thread coordinate.
     */
    protected static threadIsInSight(coordinate: ClientRect | DOMRect): boolean {
        return ((coordinate.top >= 0) && (coordinate.top <= window.innerHeight));
    }
}

//#endregion


//#region Page Options

/**
 * Elements of the page.
 */
interface ElementsInstances {
    upNavArrow: HTMLDivElement;
    downNavArrow: HTMLDivElement;
    boardStatsBox: HTMLDivElement;
    favoritesBox: HTMLDivElement;
    autorefresh: HTMLInputElement;
    postPanelInstance: HTMLElement;
    checkboxInstance: HTMLElement;
    spoilerInstance: HTMLElement;
    customDownloadButton: HTMLDivElement;
}

/**
 * Options of the elements.
 */
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
    customDownloadButtonDisplay: string;
}

/**
 * Manages page options.
 */
export abstract class PageOptions {
    public static readonly selectors = {
        upNavArrow: "#up-nav-arrow",
        downNavArrow: "#down-nav-arrow",
        boardStatsBox: "#boardstats-box",
        favoritesBox: "#favorites-box",
        autorefresh: "#autorefresh-checkbox-bot",
        postPanel: ".postpanel",
        checkbox: `.post-details > input[type="checkbox"]`,
        spoiler: ".spoiler",
        customDownloadButton: `.${PageElements.customClasses.downloadButton}`
    };
    protected static _elements: ElementsInstances = undefined;
    protected static _defaults: DefaultOptions = undefined;

    /**
     * Gets a page elements.
     */
    public static main(): void {
        this._elements = {
            upNavArrow: this.getElement(this.selectors.upNavArrow) as HTMLDivElement,
            downNavArrow: this.getElement(this.selectors.downNavArrow) as HTMLDivElement,
            boardStatsBox: this.getElement(this.selectors.boardStatsBox) as HTMLDivElement,
            favoritesBox: this.getElement(this.selectors.favoritesBox) as HTMLDivElement,
            autorefresh: this.getElement(this.selectors.autorefresh) as HTMLInputElement,
            customDownloadButton: this.getElement(this.selectors.customDownloadButton) as HTMLDivElement,
            postPanelInstance: this.getElement(this.selectors.postPanel),
            checkboxInstance: this.getElement(this.selectors.checkbox),
            spoilerInstance: this.getElement(this.selectors.spoiler)
        };
    }

    /**
     * Gets a defaults options of the elements.
     */
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
            spoilerColor: this._elements.spoilerInstance ? this._elements.spoilerInstance.style.color : undefined,
            customDownloadButtonDisplay: this._elements.customDownloadButton ? this._elements.customDownloadButton.style.display : undefined
        };
    }

    /**
     * Changes an elements options to necessary ones.
     */
    public static change(): void {
        // Should always gets defaults, because the user
        // can change an options (e.g. scroll, autorefresh).
        this.getDefaults();

        // Trying to make pages with a bad scrolling work, e.g. ones
        // with "body {overflow-y: scroll;}" can break window.scrollTo().
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflowY = "visible";

        this._elements.autorefresh && this._defaults.autorefreshChecked ? this._elements.autorefresh.click() : null;

        // "display: none" not works for capturing of this elements.
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

        const customDownloadButtons = document.querySelectorAll<HTMLElement>(this.selectors.customDownloadButton);
        customDownloadButtons.forEach((element) => {
            element.style.display = "none";
        });
    }

    /**
     * Restores a defaults options of the elements.
     */
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

        const customDownloadButtons = document.querySelectorAll<HTMLElement>(this.selectors.customDownloadButton);
        customDownloadButtons.forEach((element) => {
            element.style.display = this._defaults.customDownloadButtonDisplay;
        });

        // should be at the end because of `postPanels` and `checkboxes` display change.
        window.scrollTo(this._defaults.scrollX, this._defaults.scrollY);
    }

    /**
     * Gets an element of the page.
     * If error occurs, then the error will be printed through `console.warn`.
     *
     * @param selector The selector of an elements.
     *
     * @returns If finded, then `HTMLElement` will be returned, else undefined.
     */
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

/**
 * Method of screenshot starting.
 */
type ScreenshotMethod = (...args: any[]) => Promise<any>;

/**
 * Handles screenshot requests.
 */
export abstract class Screenshot {
    private static _settings: UserSettings = undefined;

    /**
     * Starts screenshot of the active posts.
     */
    public static async posts(): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        await this.run(
            () => {return PostsScreenshot.start()},
            async () => {
                await CommonScreenshot.end("posts");

                if (this._settings.posts.turnOffPosts) {
                    PageElements.turnOffActivePosts();
                }
            }
        );
    }

    /**
     * Starts screenshot of the thread.
     */
    public static thread(): Promise<void> {
        return this.run(
            () => {return ThreadScreenshot.start()},
            () => {return CommonScreenshot.end("thread")}
        );
    }

    /**
     * Updates a current user settings.
     */
    public static async updateSettings(): Promise<void> {
        this._settings = await this.getSettings();
    }

    /**
     * Gets an user settings for the `settingsScreenshot` key.
     */
    protected static getSettings(): Promise<UserSettings> {
        return Settings.get("settingsScreenshot");
    }

    /**
     * Runs screenshot capturing.
     *
     * @param startMethod The start function.
     * @param endMethod The end function.
     */
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
