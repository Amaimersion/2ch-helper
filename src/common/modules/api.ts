import {UserSettings, StorageSync} from "@modules/storage-sync";
import {Message} from "@modules/communication";


type GetMethod<T> = (
    dcmnt: Document | HTMLElement,
    selector: string
) => T;

type CheckMethod<T> = (
    value: T
) => boolean;

export interface GetParams {
    selector: string | string[];
    errorMessage?: string;
    dcmnt?: any;
}

export abstract class API {
    public static getThread(): HTMLFormElement {
        return this.getElement<HTMLFormElement>({
            selector: "#posts-form",
            errorMessage: "The thread form does not exists."
        });
    }

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

    public static async getSettings(key: string, existingSettings: UserSettings = undefined): Promise<UserSettings> {
        let settings: UserSettings = undefined;

        if (existingSettings) {
            settings = existingSettings[key];
        } else {
            settings = await StorageSync.get(key);
        }

        if (!settings || !Object.keys(settings).length) {
            throw new Error(`A settings for "${key}" key is undefined.`);
        }

        if (
            (existingSettings && !Object.keys(settings).length) ||
            (!existingSettings && !Object.keys(settings[key]).length)
        ) {
            console.warn(`A settings for the "${key}" key is empty.`);
        }

        return existingSettings ? settings : settings[key];
    }

    public static createTimeout(time: number): Promise<void> {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                return resolve();
            }, time);
        });
    }

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

    public static isErrorResponse(response: Message.Response): boolean {
        return (!response || !response.status || response.errorText) ? true : false;
    }

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
