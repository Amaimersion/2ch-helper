/**
 * Messages.
 */
export namespace Message {
    export type AnyMessage = Content | Background;

    export interface Response {
        status: boolean;
        errorText?: string;
    }

    interface Message {
        type: string;
        command?: string;
        data?: any;
    }

    export interface Content extends Message {}
    export interface Background extends Message {}
}


/**
 * Scripts for message sending.
 */
export namespace Script {
    export type Query = chrome.tabs.QueryInfo;
    export type Tab = chrome.tabs.Tab;

    /**
     * The parent for subclasses.
     */
    abstract class Script {
        /**
         * Send message to the tab.
         *
         * @param message
         * The message for sending.
         *
         * @param tabId
         * The id of a tab.
         * If specified, then a message will be sended to the content scripts,
         * else a message will be sended to the background scripts.
         * Defaults to `undefined`.
         */
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

        /**
         * Gets all tabs that have the specified properties,
         * or all tabs if no properties are specified.
         *
         * @param queryInfo The information for query.
         */
        protected static createQuery(queryInfo: Query = {}): Promise<Tab[]> {
            return new Promise((resolve) => {
                chrome.tabs.query(queryInfo, (result) => {
                    return resolve(result);
                })
            })
        }
    }

    /**
     * Sending a messages from the content script.
     */
    export abstract class Content extends Script {
        /**
         * Sends a message to the background scripts.
         *
         * @param message The message for sending.
         */
        public static sendMessageToBackground(message: Message.Background): Promise<Message.Response> {
            return this.sendMessageToTab(message);
        }
    }

    /**
     * Sending a messages from the background script.
     */
    export abstract class Background extends Script {
        /**
         * Sends a message to the active content script.
         *
         * @param message
         * The message for sending.
         *
         * @param queryInfo
         * The information for query.
         * Defaults to `{active: true, currentWindow: true}`.
         * Defaults properties cannot be overwritten.
         *
         * @throws Throws an error if cannot get an active tab.
         */
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

        /**
         * Sends a message to the all content scripts.
         *
         * @param message
         * The message for sending.
         *
         * @param queryInfo
         * The information for query.
         * Defaults to `{}`.
         */
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


/**
 * On Message events.
 */
export namespace OnMssg {
    /**
     * Message event.
     */
    export interface MessageEvent<T> {
        (
            message: T,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response: Message.Response) => void
        ): Promise<void>;
    }

    /**
     * Attach handler to the listener port.
     *
     * @param handler The handler for attachment.
     */
    export function attach<T>(handler: MessageEvent<T>): void {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            handler(message, sender, sendResponse);
            return true; // in order to support asynchronous response.
        });
    }

    /**
     * The parent for subclasses.
     */
    export abstract class OnMessage {
        /**
         * Runs the async method and sends response.
         *
         * @param method
         * The method for execution.
         *
         * @param sendResponse
         * The function for response sending.
         *
         * @param successProps
         * The properties that will be passed to the sendResponse when success occuress.
         * Defaults to `{status: true}`.
         * Defaults cannot be overwritten.
         *
         * @param errorProps
         * The properties that will be passed to the sendResponse when error occuress.
         * Defaults to `{status: false, errorText: error.message}`.
         * Defaults cannot be overwritten.
         *
         * @throws Throws an error if occurs.
         */
        protected static async runAsyncMethod(
            method: (...args: any[]) => Promise<any>,
            sendResponse: (response: Message.Response) => void,
            successProps: object = {},
            errorProps: object = {}
        ): Promise<void> {
            try {
                await method();
            } catch (error) {
                sendResponse({...errorProps, ...{status: false, errorText: error.message}});
                throw error;
            }

            sendResponse({...successProps, ...{status: true}});
        }

        /**
         * Formats an object for pretty-print.
         *
         * @param obj The object for formatting.
         *
         * @example
         * obj = {version: 1.0, name: "2ch-helper", url: "github.com/Amaimersion/2ch-helper"};
         * Returns:
           `{
                "version": 1,
                "name": "2ch-helper",
                "url": "github.com/Amaimersion/2ch-helper"
            }`
         */
        protected static formatObject(obj: Object): string {
            return JSON.stringify(obj, null, 4);
        }

        /**
         * Generates a text for unknown message error.
         *
         * @param message
         * The message for info output.
         *
         * @param sender
         * The sender for info output.
         *
         * @param text
         * The text for info output.
         * Defaults to `Unknown message.`.
         * If specified, then it should not contain control characters (`\n`, `\t` and so on).
         */
        protected static getUnknownMessageErrorText(message: Object, sender: Object, text: string = undefined): string {
            return (
                text ? `${text}\n` : "Unknown message.\n" +
                `Message - ${this.formatObject(message)}\n` +
                `Sender - ${this.formatObject(sender)}`
            );
        }
    }
}
