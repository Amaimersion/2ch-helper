import {Script} from "@modules/communication";
import {API} from "@modules/api";


type NotificationOptions = chrome.notifications.NotificationOptions;
type Sender = chrome.runtime.MessageSender;

/**
 * Handlse notifications requests.
 */
export abstract class Notifications {
    private static _lastNotificationId: string = undefined;
    private static _lastSender: Sender = undefined;

    /**
     * Runs when the page is loaded.
     *
     * Binds an event for the buttons of notification.
     */
    public static main(): void {
        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
            this.showButtonEvent(notificationId, buttonIndex);
        });
    }

    /**
     * Creates a reply notification.
     *
     * @param options The options for notification.
     * @param sender The sender tab.
     */
    public static async createReplyNotification(options: NotificationOptions, sender: Sender): Promise<void> {
        this._lastSender = sender;

        const notificationOptions: NotificationOptions = {...options,
            type: "basic",
            iconUrl: chrome.extension.getURL("/interface/icons/logo/logo-48.png")
        };

        if (API.isGoogleChrome()) {
            notificationOptions.buttons = [
                {title: "Показать"}
            ];
        }

        chrome.notifications.create(notificationOptions, (notificationId) => {
            this._lastNotificationId = notificationId;
            console.log(this._lastNotificationId);
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

        // callback is not optional.
        // report in issue in DefinitelyTyped.
        try {
            chrome.tabs.highlight({tabs: this._lastSender.tab.index}, () => {});
        } catch (error) {
            // if the sender page is active, then will be error. Ignore it.
            console.error(error);
        }

        Script.Background.sendMessageToActiveContent({
            type: "command",
            command: "updateLastNotificationHref"
        });
    }
}
