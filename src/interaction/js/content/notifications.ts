import {Script} from "@modules/communication";
import {API} from "@modules/api";


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
                if (!Observer.isNewPostNode(node as HTMLElement)) {
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
    protected static isNewPostNode(node: HTMLElement): boolean {
        const postTags = ["div"];
        const postId = new RegExp(/((post)-*)/, "");

        return (
            node.tagName &&
            postTags.includes(node.tagName.toLowerCase()) &&
            node.id &&
            postId.test(node.id.toLowerCase())
        );
    }

    /**
     * Checks if a post is the reply post.
     *
     * @param post The post for checking.
     */
    protected static isReplyPost(post: HTMLElement): boolean {
        const replyPostClasses = ["reply-posts-marker"];

        const containClass = replyPostClasses.some((element) => {
            return post.classList.contains(element);
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
    private static _lastHref: string = undefined;

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
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
        this._lastHref = postInfo.href;
        this.createReplyNotification({
            title: "Ответ на Ваш пост",
            message: postInfo.message,
            contextMessage: this._pageTitle
        });
    }

    /**
     * Updates the window href to the latest post reply href.
     */
    public static updateLastHref(): void {
        window.location.href = this._lastHref;
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
        const messageElement = node.querySelector<HTMLElement>(".post-message");
        const messageText = messageElement ? messageElement.innerText : "Не удалось получить сообщение поста.";

        const href = node.id ? `${window.location.pathname}#${node.id}` : window.location.pathname;

        return {message: messageText, href: href};
    }

    /**
     * Sends a message to create the reply notification.
     *
     * @param options The options for notification.
     */
    protected static async createReplyNotification(options: chrome.notifications.NotificationOptions): Promise<void> {
        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "createReplyNotification",
            data: {
                options: options
            }
        });

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || "Could not create a notification.");
        }
    }
}