import {DOMLoaded} from "@modules/dom";
import {Message, Script} from "@modules/communication";
import {API} from "@modules/api";


interface PopupElementEvent {
    id: string;
    type: string;
    event: (...args: any[]) => any;
}

interface ErrorArguments {
    errorText?: string;
    displayTime?: number;
    notificationElementId?: string;
}


abstract class PageInfo {
    public static elementsEvents: PopupElementEvent[] = [
        {
            id: "screenshot-of-posts",
            type: "click",
            event: function() {
                Popup.defaultElementEvent(
                    {type: "command", command: "screenshotPosts"}
                );
            }
        },
        {
            id: "screenshot-of-thread",
            type: "click",
            event: function() {
                Popup.defaultElementEvent(
                    {type: "command", command: "screenshotThread"}
                );
            }
        },
        {
            id: "download-images",
            type: "click",
            event: function() {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadImages"}
                );
            }
        },
        {
            id: "download-video",
            type: "click",
            event: function() {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadVideo"}
                );
            }
        },
        {
            id: "download-media",
            type: "click",
            event: function() {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadMedia"}
                );
            }
        },
        {
            id: "download-thread",
            type: "click",
            event: function() {
                Popup.defaultElementEvent(
                    {type: "command", command: "downloadThread"}
                )
            }
        }
    ];
}


abstract class Popup {
    private static timeoutId: number = null;

    public static main(): void {
        this.bindEvents();
    }

    public static bindEvents(): void {
        for (let elementEvent of PageInfo.elementsEvents) {
            const element = document.getElementById(elementEvent.id);

            if (!element) {
                console.error(`Could not find an element with the id - "${elementEvent.id}".`);
                continue;
            }

            element.addEventListener(elementEvent.type, elementEvent.event);
        }
    }

    public static displayError(args: ErrorArguments): void {
        const errorText = args.errorText || "Error";
        const displayTime = args.displayTime || 2000;
        const notificationElementId = args.notificationElementId || "version";

        if (this.timeoutId != null) {
            console.warn("Created timeout is still running.");
            console.error(errorText);
            return;
        }

        const notificationElement = document.getElementById(notificationElementId);

        if (!notificationElement) {
            console.warn(`Could not find an element with the id "${notificationElementId}" to display an error.`);
            console.error(errorText);
            return;
        }

        const oldText = notificationElement.innerText;
        notificationElement.innerText = errorText;

        this.timeoutId = window.setTimeout(() => {
            notificationElement.innerText = oldText;
            this.timeoutId = null;
        }, displayTime);
    }

    public static async defaultElementEvent(message: Message.AnyMessage, errorArgs?: ErrorArguments): Promise<void> {
        const response = await Script.Background.sendMessageToActiveContent(message);

        if (API.isErrorResponse(response))
            this.displayError(errorArgs || {});
    }
}


DOMLoaded.run(() => Popup.main());
