import {Script} from "@modules/communication";
import {API} from "@modules/api";
import {Settings} from "@modules/settings";


/**
 * Observation for changes of the page.
 */
abstract class Observer {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this.bindObserver();
    }

    /**
     * Binds an observer to the page.
     */
    protected static bindObserver(): void {
        const config: MutationObserverInit = {
            subtree: true,
            childList: true
        };
        const observer = new MutationObserver(this.observerEvent);

        observer.observe(API.getThread(), config);
    }

    /**
     * The event for an observer callback.
     */
    protected static observerEvent: MutationCallback = (mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (!Observer.isPostNode(node as HTMLElement)) {
                    continue;
                }

                if (Observer.isReplyPost(node as HTMLElement)) {
                    Notifications.replyPostEvent(node as HTMLElement);
                }
            }
        }
    }

    /**
     * Checks if a node is the post (user message) node.
     *
     * @param node The node for checking.
     */
    protected static isPostNode(node: HTMLElement): boolean {
        const postTags = ["div"];
        const postId = new RegExp(/((post)-*)/, "");

        return (
            node.tagName &&
            postTags.includes(node.tagName.toLowerCase()) &&
            (
                // old layout, without empty parent div.
                (
                    node.id &&
                    postId.test(node.id.toLowerCase()
                )) ||

                // now all new posts is wrapped in empty div.
                (
                    node.firstElementChild &&
                    node.firstElementChild.id &&
                    postId.test(node.firstElementChild.id.toLowerCase())
                )
            )
        );
    }

    /**
     * Checks if a post is the reply post.
     *
     * @param post The post for checking.
     */
    protected static isReplyPost(post: HTMLElement): boolean {
        const replyPostClasses = [
            ".post_type_replied"
        ];

        const containClass = replyPostClasses.some((element) => {
            return !!post.querySelector(element);
        });

        return containClass;
    }
}

/**
 * Necessary information about the new post.
 */
interface PostInfo {
    message: string;
    href: string;
}

/**
 * Handles notification requests.
 */
export abstract class Notifications {
    private static _pageTitle: string = undefined;

    /**
     * Runs when the page is loaded.
     */
    public static async main(): Promise<void> {
        const settings = await Settings.get("settingsOther");

        if (!settings.other.notificationWhenReply) {
            return;
        }

        Observer.main();
        this._pageTitle = this.getPageTitle();
    }

    /**
     * An event for the reply (on the user message) post.
     *
     * Creates a notification.
     *
     * @param node The post div.
     */
    public static replyPostEvent(node: HTMLElement): void {
        const postInfo = this.getPostInfo(node);
        this.createReplyNotification({
            title: "Ответ на Ваш пост",
            message: postInfo.message,
            contextMessage: this._pageTitle
        }, postInfo.href);
    }

    /**
     * Updates the window href to the latest post reply href.
     *
     * @param href The `window.location.href` will be replaced by this url.
     */
    public static updateLastHref(href: string): void {
        window.location.href = href;
    }

    /**
     * Gets a title of the current page.
     */
    protected static getPageTitle(): string {
        return document.title || window.location.pathname || "Не удалось получить название треда";
    }

    /**
     * Gets an info about the post.
     *
     * @param node The post div.
     */
    protected static getPostInfo(node: HTMLElement): PostInfo {
        const messageElement = node.querySelector<HTMLElement>(".post__message");
        const messageText = messageElement ? messageElement.innerText : "Не удалось получить сообщение поста.";

        if (!node.id) {
            // in new layout a new posts is wrapped in empty div.
            // so, we are searching for actual post.
            node = node.querySelector(`[id*=post]`);
        }

        const href = node.id ? `${window.location.pathname}#${node.id}` : window.location.pathname;

        return {message: messageText, href: href};
    }

    /**
     * Sends a message to create the reply notification.
     *
     * @param options The options for notification.
     * @param postHref The href of the new post.
     */
    protected static async createReplyNotification(options: chrome.notifications.NotificationOptions, postHref: string): Promise<void> {
        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "createReplyNotification",
            data: {
                options: options,
                postHref: postHref
            }
        });

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || "Could not create a notification.");
        }
    }
}
