//#region Message Interfaces

export interface Message extends ContentMessage, BackgroundMessage {}

export interface ContentMessage {
    type?: string;
    name?: string;
    method?: string;
    command?: string;
}

export interface BackgroundMessage {
    type?: string;
    command?: string;
    data?: any;
}

//#endregion


//#region Message Interaction Classes

export abstract class Script {
    public static sendMessageToTab(message: Message, tabId: number = undefined): Promise<any> {
        return new Promise((resolve) => {
            if (tabId !== undefined) {
                chrome.tabs.sendMessage(tabId, message, (response) => {
                    return resolve(response);
                });
            } else {
                chrome.runtime.sendMessage(message, (response) => {
                    return resolve(response);
                })
            }
        });
    }

    public static createQuery(queryInfo: chrome.tabs.QueryInfo = {}): Promise<chrome.tabs.Tab[]> {
        return new Promise((resolve) => {
            chrome.tabs.query(queryInfo, (tabs) => {
                return resolve(tabs);
            });
        });
    }
}

export abstract class ContentScript extends Script {
    public static async sendMessageToBackgroundScript(message: BackgroundMessage): Promise<any> {
        const response = await this.sendMessageToTab(message);
        return response;
    }
}

export abstract class BackgroundScript extends Script {
    public static async sendMessageToActiveContentScript(message: ContentMessage, queryInfo: chrome.tabs.QueryInfo = {}): Promise<any> {
        queryInfo.active = true;
        queryInfo.currentWindow = true;

        const tabs = await this.createQuery(queryInfo);
        const tabId = tabs[0].id;
        const response = await this.sendMessageToTab(message, tabId);

        return response;
    }

    public static async sendMessageToAllContentScripts(message: ContentMessage, queryInfo: chrome.tabs.QueryInfo = {}): Promise<void> {
        const tabs = await this.createQuery(queryInfo);

        for (let tab of tabs) {
            this.sendMessageToTab(message, tab.id);
        }
    }
}

//#endregion
