import {DOMLoaded} from "@modules/dom";
import {Message, Script} from "@modules/communication";
import {API} from "@modules/api";


interface PopupElementEvent {
    selector: string;
    type: string;
    event: (...args: any[]) => any;
}

interface ErrorArguments {
    errorText?: string;
    displayTime?: number;
    notificationElementSelector?: string;
}


abstract class PageInfo {
    protected static readonly _elementsEvents: PopupElementEvent[] = [
        {
            selector: "#screenshot-of-posts",
            type: "click",
            event: () => {
                Popup.defaultElementEvent(
                    {type: "command", command: "screenshotPosts"},
                    {url: "*://2ch.hk/*/res/*"},
                    {errorText: "Активный тред не найден"}
                );
            }
        },
        {
            selector: "#screenshot-of-thread",
            type: "click",
            event: () => {
                Popup.defaultElementEvent(
                    {type: "command", command: "screenshotThread"},
                    {url: "*://2ch.hk/*/res/*"},
                    {errorText: "Активный тред не найден"}
                );
            }
        },
        {
            selector: "#download-images",
            type: "click",
            event: () => {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadImages"},
                    {url: "*://2ch.hk/*/res/*"},
                    {errorText: "Активный тред не найден"}
                );
            }
        },
        {
            selector: "#download-video",
            type: "click",
            event: () => {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadVideo"},
                    {url: "*://2ch.hk/*/res/*"},
                    {errorText: "Активный тред не найден"}
                );
            }
        },
        {
            selector: "#download-media",
            type: "click",
            event: () => {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadMedia"},
                    {url: "*://2ch.hk/*/res/*"},
                    {errorText: "Активный тред не найден"}
                );
            }
        },
        {
            selector: "#download-thread",
            type: "click",
            event: () => {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadThread"},
                    {url: "*://2ch.hk/*/res/*"},
                    {errorText: "Активный тред не найден"}
                )
            }
        }
    ];
}


abstract class Popup extends PageInfo {
    private static _timeoutId: number = null;

    public static main(): void {
        this.bindEvents();
    }

    public static async defaultElementEvent(
        message: Message.Content,
        queryInfo: chrome.tabs.QueryInfo = {},
        errorArgs: ErrorArguments = {}
    ): Promise<void> {
        let response: Message.Response = undefined;

        try {
            response = await Script.Background.sendMessageToActiveContent(message, queryInfo);
        } catch (error) {
            this.displayError(errorArgs);
            throw error;
        }

        if (API.isErrorResponse(response)) {
            this.displayError({errorText: response.errorText});
        }
    }

    protected static bindEvents(): void {
        for (let elementEvent of this._elementsEvents) {
            let element: HTMLDivElement = undefined;

            try {
                element = API.getElement<HTMLDivElement>({
                    selector: elementEvent.selector
                });
            } catch (error) {
                console.error(error);
                continue;
            }

            element.addEventListener(elementEvent.type, elementEvent.event);
        }
    }

    protected static displayError(args: ErrorArguments): void {
        const errorText = args.errorText || "Ошибка";
        const displayTime = args.displayTime || 2000;
        const notificationElementSelector = args.notificationElementSelector || "#version";

        if (this._timeoutId !== null) {
            console.warn("Created timeout is still running.");
            throw new Error(errorText);
        }

        let notificationElement: HTMLElement = undefined;

        try {
            notificationElement = API.getElement<HTMLElement>({
                selector: notificationElementSelector,
                errorMessage: "Could not find an element to display an error."
            });
        } catch (error) {
            console.error(errorText);
            throw error;
        }

        const oldText = notificationElement.innerText;
        notificationElement.innerText = errorText;

        this._timeoutId = window.setTimeout(() => {
            notificationElement.innerText = oldText;
            this._timeoutId = null;
        }, displayTime);
    }
}


DOMLoaded.run(() => Popup.main());
