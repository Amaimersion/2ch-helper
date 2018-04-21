import {Page} from "@modules/Communication";


class PopupElementEvent {
    public id: string;
    public type: string;
    public event: () => void;

    constructor(id: string, type: string, event: () => void) {
        this.id = id;
        this.type = type;
        this.event = event;
    }
}


class Popup {
    static elementsEvents: PopupElementEvent[] = [
        new PopupElementEvent(
            "screenshot-of-posts",
            "onclick",
            function() {
                Page.sendMessageToContent({type: "API", name: "screenshot", method: "createScreenshotOfPosts"})
            }
        ),
        new PopupElementEvent(
            "screenshot-of-thread",
            "onclick",
            function() {
                Page.sendMessageToContent({type: "API", name: "screenshot", method: "createScreenshotOfThread"})
            }
        ),
        new PopupElementEvent(
            "download-images",
            "onclick",
            function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadImages"})
            }
        ),
        new PopupElementEvent(
            "download-video",
            "onclick",
            function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadVideo"})
            }
        ),
        new PopupElementEvent(
            "download-media",
            "onclick",
            function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadMedia"})
            }
        ),
        new PopupElementEvent(
            "download-thread",
            "onclick",
            function() {
                Page.sendMessageToContent({type: "API", name: "download", method: "downloadThread"})
            }
        )
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
