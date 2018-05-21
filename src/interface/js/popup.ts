import {Page, Message} from "@modules/Communication";
import {DOMLoaded} from "@modules/DOM";


interface PopupElementEvent {
    id: string;
    type: string;
    event: () => void;
}


interface ErrorArguments {
    errorText?: string;
    displayTime?: number;
    notificationElementId?: string;
}


class Popup {
    static elementsEvents: PopupElementEvent[] = [
        {
            id: "screenshot-of-posts",
            type: "onclick",
            event: Popup.defaultElementEvent(
                {type: "API", name: "screenshot", method: "createScreenshotOfPosts"}
            )
        },
        {
            id: "screenshot-of-thread",
            type: "onclick",
            event: Popup.defaultElementEvent(
                {type: "API", name: "screenshot", method: "createScreenshotOfThread"}
            )
        },
        {
            id: "download-images",
            type: "onclick",
            event: Popup.defaultElementEvent(
                {type: "API", name: "download", method: "downloadImages"}
            )
        },
        {
            id: "download-video",
            type: "onclick",
            event: Popup.defaultElementEvent(
                {type: "API", name: "download", method: "downloadVideo"}
            )
        },
        {
            id: "download-media",
            type: "onclick",
            event: Popup.defaultElementEvent(
                {type: "API", name: "download", method: "downloadMedia"}
            )
        },
        {
            id: "download-thread",
            type: "onclick",
            event: Popup.defaultElementEvent(
                {type: "API", name: "download", method: "downloadThread"}
            )
        }
    ];
    static timeoutId: number = null;

    static main(): void {
        Popup.bindEvents();
    }

    static bindEvents(): void {
        for (let elementEvent of Popup.elementsEvents) {
            const element = document.getElementById(elementEvent.id);

            if (element)
                element[elementEvent.type] = elementEvent.event;
            else
                console.error(`Could not find an element with the id - "${elementEvent.id}".`);
        }
    }

    static displayError(args: ErrorArguments): void {
        const errorText = args.errorText || "Error";
        const displayTime = args.displayTime || 2000;
        const notificationElementId = args.notificationElementId || "version";

        if (Popup.timeoutId != null) {
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

        Popup.timeoutId = window.setTimeout(() => {
            notificationElement.innerText = oldText;
            Popup.timeoutId = null;
        }, displayTime);
    }

    static defaultElementEvent(message: Message, errorArgs?: ErrorArguments): () => void {
        return function() {
            Page.sendMessageToContentScript(message, (response) => {
                if (!response || response.error) {
                    Popup.displayError(errorArgs || {});
                }
            });
        }
    }
}


DOMLoaded.runFunction(Popup.main);
