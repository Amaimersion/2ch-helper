export default class Popup {
    static Message: (type: string, name: string, method: string) => void;
    static elementsEvents: Array<{id: string, type: string, event: () => void}>;
    static main: () => void;
    static bindEvents: () => void;
    static sendMessageToContent: (message: Object, callback?: (response: any) => void) => void;
}


Popup.Message = function(type: string, name: string, method: string): void {
    this.type = type || undefined;
    this.name = name || undefined;
    this.method = method || undefined;
}


Popup.elementsEvents = [
    {
        id: 'screenshot-of-posts',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'screenshot', 'createScreenshotOfPosts')
            );
        }
    },
    {
        id: 'screenshot-of-thread',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'screenshot', 'createScreenshotOfThread')
            );
        }
    },
    {
        id: 'download-images',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadImages')
            );
        }
    },
    {
        id: 'download-video',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadVideo')
            );
        }
    },
    {
        id: 'download-media',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadMedia')
            );
        }
    },
    {
        id: 'download-thread',
        type: 'onclick',
        event: function() {
            Popup.sendMessageToContent(
                new Popup.Message('API', 'download', 'downloadThread')
            );
        }
    }
];


Popup.main = function() {
    Popup.bindEvents();
}


Popup.bindEvents = function() {
    for (let elementEvent of Popup.elementsEvents) {
        const element = document.getElementById(elementEvent.id);
        element[elementEvent.type] = elementEvent.event;
    }
}


Popup.sendMessageToContent = function(message: Object, callback?: (response: any) => void): void {
    callback = callback || function() {};

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            callback(response);
        });
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Popup.main);
} else {
    Popup.main();
}
