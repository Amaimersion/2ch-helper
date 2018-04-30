import {Page, Message} from "@modules/Communication";


interface PopupElementEvent {
    id: string;
    type: string;
    event: () => void;
}


class Popup {
    static elementsEvents: PopupElementEvent[] = [
        {
            id: "screenshot-of-posts",
            type: "onclick",
            event: Popup.defaultElementEvent({type: "API", name: "screenshot", method: "createScreenshotOfPosts"})
        },
        {
            id: "screenshot-of-thread",
            type: "onclick",
            event: Popup.defaultElementEvent({type: "API", name: "screenshot", method: "createScreenshotOfThread"})
        },
        {
            id: "download-images",
            type: "onclick",
            event: Popup.defaultElementEvent({type: "API", name: "download", method: "downloadImages"})
        },
        {
            id: "download-video",
            type: "onclick",
            event: Popup.defaultElementEvent({type: "API", name: "download", method: "downloadVideo"})
        },
        {
            id: "download-media",
            type: "onclick",
            event: Popup.defaultElementEvent({type: "API", name: "download", method: "downloadMedia"})
        },
        {
            id: "download-thread",
            type: "onclick",
            event: Popup.defaultElementEvent({type: "API", name: "download", method: "downloadThread"})
        }
    ];

    static main(): void {
        Popup.bindEvents();
    }

    static defaultElementEvent(message: Message): () => void {
        return function() {
            Page.sendMessageToContent(message, (response) => {
                if (!response || response.error) {
                    const version = document.getElementById("version");

                    if (!version) return;

                    const oldText = version.innerText;

                    version.innerText = "Ошибка";

                    window.setTimeout(() => {
                        version.innerText = oldText;
                    }, 5000);
                }
            });
        }
    }

    static bindEvents(): void {
        for (let elementEvent of Popup.elementsEvents) {
            const element = document.getElementById(elementEvent.id);
            element[elementEvent.type] = elementEvent.event;
        }
    }
}


if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", Popup.main);
} else {
    Popup.main();
}
