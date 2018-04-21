import {Page} from "@modules/Communication";


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
            event: function() {
                Page.sendMessageToContent({type: "API", name: "screenshot", method: "createScreenshotOfPosts"})
            }
        },
        {
            id: "screenshot-of-thread",
            type: "onclick",
            event: function() {
                Page.sendMessageToContent({type: "API", name: "screenshot", method: "createScreenshotOfThread"})
            }
        },
        {
            id: "download-images",
            type: "onclick",
            event: function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadImages"})
            }
        },
        {
            id: "download-video",
            type: "onclick",
            event: function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadVideo"})
            }
        },
        {
            id: "download-media",
            type: "onclick",
            event: function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadMedia"})
            }
        },
        {
            id: "download-thread",
            type: "onclick",
            event: function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadThread"})
            }
        }
    ];

    static main(): void {
        Popup.bindEvents();
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
