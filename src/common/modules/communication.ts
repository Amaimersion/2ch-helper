export namespace Message {
    export type AnyMessage = Content | Background;

    export interface Response {
        status: boolean;
    }

    interface Message {
        type: string;
        command: string;
    }

    export interface Content extends Message {}

    export interface Background extends Message {
        data?: any;
    }
}


export namespace Script {
    export type Query = chrome.tabs.QueryInfo;
    export type Tab = chrome.tabs.Tab;

    abstract class Script {
        protected static sendMessageToTab(message: Message.AnyMessage, tabId: number = undefined): Promise<Message.Response> {
            return new Promise((resolve) => {
                if (tabId) {
                    chrome.tabs.sendMessage(tabId, message, (response) => {
                        return resolve(response);
                    });
                } else {
                    chrome.runtime.sendMessage(message, (response) => {
                        return resolve(response);
                    });
                }
            });
        }

        protected static createQuery(queryInfo: Query = {}): Promise<Tab[]> {
            return new Promise((resolve) => {
                chrome.tabs.query(queryInfo, (result) => {
                    return resolve(result);
                })
            })
        }
    }

    export abstract class Content extends Script {
        public static sendMessageToBackground(message: Message.Background): Promise<Message.Response> {
            return this.sendMessageToTab(message);
        }
    }

    export abstract class Background extends Script {
        public static async sendMessageToActiveContent(message: Message.Content, queryInfo: Query = {}): Promise<Message.Response> {
            queryInfo.active = true;
            queryInfo.currentWindow = true;

            const tabs = await this.createQuery(queryInfo);

            if (!tabs.length) {
                throw new Error("Tabs list is empty.");
            }

            const tabId = tabs[0].id;
            const response = await this.sendMessageToTab(message, tabId);

            return response;
        }

        public static async sendMessageToAllContent(message: Message.Content, queryInfo: Query = {}): Promise<Promise<Message.Response>[]> {
            const tabs = await this.createQuery(queryInfo);
            const promises: Promise<Message.Response>[] = [];

            for (let tab of tabs) {
                promises.push(
                    this.sendMessageToTab(message, tab.id)
                );
            }

            return promises;
        }
    }
}


export namespace OnMssg {
    export interface MessageEvent<T> {
        (
            message: T,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response: Message.Response) => void
        ): void;
    }

    export function attach<T>(handler: MessageEvent<T>): void {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            handler(message, sender, sendResponse);
        });
    }

    export abstract class OnMessage {
        protected static formatObject(obj: Object): string {
            return JSON.stringify(obj, null, 4);
        }

        protected static getUnknownMessageErrorText(message: Object, sender: Object, text: string = undefined): string {
            return (
                text ? `${text}\n` : "Unknown message.\n" +
                `Message - ${this.formatObject(message)}\n` +
                `Sender - ${this.formatObject(sender)}`
            );
        }
    }
}
