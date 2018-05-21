export interface Message {
    type: string;
    name: string;
    method?: string;
}


export class Page {
    static sendMessageToContentScript(message: Message): Promise<any> {
        return new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    return resolve(response);
                });
            })
        });
    }
    /*
    static sendMessageToContentScript(message: Message, responseCallback?: (response: any) => void): void {
        responseCallback = responseCallback || function() {};

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                responseCallback(response);
            });
        })
    }
    */
    /*
    static sendMessage(message: Message, responseCallback?: (response: any) => void): void {
        responseCallback = responseCallback || function() {};

        chrome.runtime.sendMessage(message, (response) => {
            responseCallback(response);
        });
    }
    */
}



//export class Content extends PageInterface {}


//export class Background extends PageInterface {}


/*
Popup.sendMessageToContent = function(message: Object, callback?: (response: any) => void): void {
    callback = callback || function() {};

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            callback(response);
        });
    });
}


SettingsIframe.sendMessageToContent = function(message, callback) {
    callback = callback || function() {};

    chrome.tabs.query({url: '*://2ch.hk/*//*'}, (tabs) => {
        for (let tab of tabs) {
            chrome.tabs.sendMessage(tab.id, message, (response) => {
                callback(response);
            });
        }
    });
}
*/
