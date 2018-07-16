import {UserSettings, StorageSync} from "@modules/storage-sync";
import {Message} from "@modules/communication";


/**
 * The get method that finds an elements on the page.
 */
type GetMethod<T> = (
    dcmnt: Document | HTMLElement,
    selector: string
) => T;

/**
 * The check method that checks an elements for valid.
 */
type CheckMethod<T> = (
    value: T
) => boolean;

/**
 * The parameters for element(s) finding.
 */
export interface GetParams {
    selector: string | string[];
    errorMessage?: string;
    dcmnt?: any;
}

/**
 * Common functions for usage in others scripts.
 */
export abstract class API {
    /**
     * Gets a thread of the current page.
     *
     * @throws Throws an error if could not get a thread.
     */
    public static getThread(): HTMLFormElement {
        let form: HTMLFormElement = undefined;

        // normal 2ch.hk.
        form = document.querySelector("#posts-form");

        // dollchan.
        if (!form) {
            form = document.querySelector("form[de-form]");
        }

        if (!form) {
            throw new Error("Could not get a thread form.");
        }

        return form;
    }

    /**
     * Gets an active tab.
     *
     * @throws Throws an error if could not get an active tab.
     */
    public static getActiveTab(): Promise<chrome.tabs.Tab> {
        return new Promise((resolve) => {
            const queryInfo: chrome.tabs.QueryInfo = {
                active: true,
                currentWindow: true
            };

            chrome.tabs.query(queryInfo, (tabs) => {
                if (!tabs.length) {
                    throw new Error("An active tab does not exists or access denied.");
                }

                return resolve(tabs[0]);
            });
        });
    }

    /**
     * Gets a settings properties.
     *
     * @param key
     * The key by which to search for settings.
     *
     * @param existingSettings
     * If passed, then search will be in it, not sync storage.
     * Defaults to `undefined`.
     *
     * @throws
     * Throws an error if settings for the key is undefined.
     *
     * @example
     * key = "screenshot";
     * StorageSync/existingSettings = {screenshot: {a: 1, b: 2}, download: {e: 5}};
     *
     * Returns: {a: 1, b: 2}
     */
    public static async getSettings(key: string, existingSettings: UserSettings = undefined): Promise<UserSettings> {
        let settings: UserSettings = undefined;

        if (existingSettings) {
            settings = existingSettings[key];
        } else {
            settings = await StorageSync.get(key);
        }

        if (!settings || !Object.keys(settings).length) {
            throw new Error(`A settings for the "${key}" key is undefined.`);
        }

        if (
            (existingSettings && !Object.keys(settings).length) ||
            (!existingSettings && !Object.keys(settings[key]).length)
        ) {
            console.warn(`A settings for the "${key}" key is empty.`);
        }

        // StorageSync returns object with the key, not just properties.
        return existingSettings ? settings : settings[key];
    }

    /**
     * Creates timeout.
     *
     * @param time The time for timeout in milliseconds.
     */
    public static createTimeout(time: number): Promise<void> {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                return resolve();
            }, time);
        });
    }

    /**
     * Finds an element on the page.
     *
     * @param params The parameters for finding.
     *
     * @throws Throws an error if could not find an element.
     */
    public static getElement<T>(params: GetParams): T {
        type CommonType = T extends Element ? T : any;

        const getMethod: GetMethod<CommonType> = (dcmnt, selector) => {
            return dcmnt.querySelector(selector);
        };
        const checkMethod: CheckMethod<CommonType> = (value) => {
            return <boolean><any>value;
        };

        return this.getElmntS<CommonType>(
            params,
            getMethod,
            checkMethod
        );
    }

    /**
     * Finds an elements on the page.
     *
     * @param params The parameters for finding.
     *
     * @throws Throws an error if could not find an elements.
     */
    public static getElements<T>(params: GetParams): NodeListOf<T extends Node ? T : any> {
        type CommonType = NodeListOf<T extends Node ? T : any>;

        const getMethod: GetMethod<CommonType> = (dcmnt, selector) => {
            return dcmnt.querySelectorAll(selector);
        };
        const checkMethod: CheckMethod<CommonType> = (elementS) => {
            return <boolean><any>elementS.length;
        };

        return this.getElmntS<CommonType>(
            params,
            getMethod,
            checkMethod
        );
    }

    /**
     * Checks if the response is the error response.
     *
     * @param response The response for checking.
     */
    public static isErrorResponse(response: Message.Response): boolean {
        return (!response || !response.status || response.errorText) ? true : false;
    }

    /**
     * Generates a hash.
     */
    public static generateHash(): string {
        return (Math.random() + 1).toString(36).slice(2);
    }

    /**
     * Common method for finding elements on the page.
     *
     * @param params The parameters for finding.
     * @param getMethod The get method that finds an elements.
     * @param checkMethod The check method that checks an elements for valid.
     *
     * @throws Throws an error if could not find an elements.
     */
    protected static getElmntS<T>(params: GetParams, getMethod: GetMethod<T>, checkMethod: CheckMethod<T>): T {
        params.dcmnt = params.dcmnt || document;
        params.errorMessage = params.errorMessage || "Could not find an element.";

        if (typeof params.selector === "string") {
            params.selector = [params.selector];
        }

        for (let selector of params.selector) {
            const value: T = getMethod(params.dcmnt, selector);

            if (checkMethod(value)) {
                return value;
            }

            console.warn(`"${selector}" selector not working.`);
        }

        throw new Error(params.errorMessage);
    }
}
