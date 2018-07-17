import {Script} from "@modules/communication";
import {API} from "@modules/api";


type NotificationOptions = chrome.notifications.NotificationOptions;
type Sender = chrome.runtime.MessageSender;

/**
 * Handlse notifications requests.
 */
export abstract class Notifications {
    private static _notificationsInfo: {[notificationId: string]: {sender: Sender, postHref: string}} = {};

    /**
     * Runs when the page is loaded.
     *
     * Binds an event for the buttons of notification and
     * binds an event for notification close.
     */
    public static main(): void {
        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            this.showButtonEvent(notificationId, buttonIndex);
        });

        chrome.notifications.onClosed.addListener((notificationId) => {
            delete this._notificationsInfo[notificationId];
        });
    }

    /**
     * Creates a reply notification.
     *
     * @param options The options for notification.
     * @param sender The sender tab.
     * @param postHref The href of the new post.
     */
    public static async createReplyNotification(options: NotificationOptions, sender: Sender, postHref: string): Promise<void> {
        const notificationOptions: NotificationOptions = {...options,
            type: "basic",
            iconUrl: chrome.extension.getURL("/interface/icons/logo/logo-48.png")
        };

        // buttons are supported only in Google Chrome.
        if (API.isGoogleChrome()) {
            notificationOptions.buttons = [
                {title: "Показать"}
            ];
        }

        chrome.notifications.create(notificationOptions, (notificationId) => {
            this._notificationsInfo[notificationId] = {
                sender: sender,
                postHref: postHref
            };
        });
    }

    /**
     * An event for the show button.
     *
     * Expected that it button will be at the 0 index.
     *
     * @param notificationId The notification id.
     * @param buttonIndex The button index.
     */
    protected static showButtonEvent(notificationId: string, buttonIndex: number): void {
        if (buttonIndex !== 0) {
            throw new Error(`Unknown button index ${buttonIndex} for ${notificationId}`);
        }

        const sender = this._notificationsInfo[notificationId].sender;
        const href = this._notificationsInfo[notificationId].postHref;

        // callback is not optional.
        // report in issues of DefinitelyTyped.
        try {
            chrome.tabs.highlight({tabs: sender.tab.index}, () => {});
        } catch (error) {
            // if the sender page is active, then will be error. Ignore it.
            console.error(error);
        }

        Script.Background.sendMessageToActiveContent({
            type: "command",
            command: "updateLastNotificationHref",
            data: {
                href: href
            }
        });
    }
}
