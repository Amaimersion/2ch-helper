import {API} from "@modules/api";


/**
 * Page elements.
 */
export namespace Elements {
    export type Thread = HTMLFormElement;
    export type Element = HTMLElement;
    export type Post = HTMLDivElement;
    export type Checkbox = HTMLInputElement;
}


/**
 * Handles checkboxes.
 */
abstract class Checkboxes {
    protected static _activePosts: Set<Elements.Post> = undefined;

    public static get activePosts(): Set<Elements.Post> {
        return Checkboxes._activePosts;
    }

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this._activePosts = new Set<Elements.Post>();
        this.bindCheckboxes();
    }

    /**
     * Binds all checkboxes.
     *
     * @param element
     * The element on which all checkboxes are searched.
     * Defaults to the current thread.
     */
    public static bindCheckboxes(element: HTMLElement = PageElements.thread): void {
        const checkboxes = API.getElements<Elements.Checkbox>({
            selector: `input[type="checkbox"]`,
            dcmnt: element,
            errorMessage: "Could not find a checkboxes."
        });

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", (event) => {
                if ((event.target as Elements.Checkbox).checked) {
                    this.eventForCheckedCheckbox(checkbox);
                } else {
                    this.eventForUncheckedCheckbox(checkbox);
                }
            });
        });
    }

    /**
     * Turns off the active posts.
     */
    public static turnOffActivePosts(): void {
        for (let post of PageElements.activePosts) {
            const checkbox = API.getElement<Elements.Checkbox>({
                selector: `input[type="checkbox"]`,
                dcmnt: post,
                errorMessage: `Could not find a checkbox of the post "${post.id}" .`
            });
            checkbox.checked = false;
        }

        this.activePosts.clear();
    }

    /**
     * Event for checkbox that gets checked.
     * Adds a post of the checkboxes to the active posts.
     *
     * @param checkbox The checkbox for the event.
     */
    protected static eventForCheckedCheckbox(checkbox: Elements.Checkbox): void {
        const post = this.getPostOfCheckbox(checkbox);
        this.activePosts.add(post);
    }

    /**
     * Event for checkbox that gets unchecked.
     * Removes a post of the checkboxes from the active posts.
     *
     * @param checkbox The checkbox for the event.
     */
    protected static eventForUncheckedCheckbox(checkbox: Elements.Checkbox): void {
        const post = this.getPostOfCheckbox(checkbox);
        const status = this.activePosts.delete(post);

        if (!status) {
            throw new Error("Could not find a post in the set.");
        }
    }

    /**
     * Gets a post of the checkbox.
     * Getting happens by the checkbox value.
     *
     * @param checkbox The checkbox of a post.
     */
    protected static getPostOfCheckbox(checkbox: Elements.Checkbox): Elements.Post {
        const value = checkbox.value;
        const postBody = API.getElement<Elements.Post>({
            selector: `#post-body-${value}`,
            dcmnt: PageElements.thread,
            errorMessage: `Could not find a post for the value "${value}".`
        });
        const post = postBody.parentElement as HTMLDivElement;

        // OP post body have incorrect size,
        // becasue image not calculated in it.
        if (post.classList.contains("oppost-wrapper")) {
            return post;
        } else {
            return postBody;
        }
    }
}


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

        observer.observe(PageElements.thread, config);
    }

    /**
     * The event for an observer callback.
     */
    protected static observerEvent: MutationCallback = (mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (!Observer.isPostNode(node as Elements.Element)) {
                    continue;
                }

                if (Observer.isReplyPost(node as Elements.Post)) {
                    Observer.replyPostEvent(node as Elements.Post);
                } else {
                    Observer.commonPostEvent(node as Elements.Post);
                }
            }
        }
    }

    /**
     * Checks if a node is the post (user message) node.
     *
     * @param node The node for checking.
     */
    protected static isPostNode(node: Elements.Element): boolean {
        const postTags = ["div"];
        const postId = new RegExp(/((post|preview)-*)/, "");

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
    protected static isReplyPost(post: Elements.Post): boolean {
        const replyPostClasses = ["reply"];

        const containClass = replyPostClasses.some((element) => {
            return post.classList.contains(element);
        });

        return containClass;
    }

    /**
     * The event for a reply post.
     *
     * 1. If an original post of the reply posts is in the active posts,
     * then sets reply post checkbox status to checked;
     * 2. Adds to the reply post checkbox original checkbox click event.
     *
     * @param replyPost The post for an event.
     */
    protected static replyPostEvent(replyPost: Elements.Post): void {
        const originalId = replyPost.id.replace("preview-", "post-");

        const originalPost = API.getElement<Elements.Post>({
            selector: `#${originalId}`,
            dcmnt: PageElements.thread,
            errorMessage: `Could not find an original post with the id "${originalId}".`
        });
        const originalCheckbox = API.getElement<Elements.Checkbox>({
            selector: `input[type="checkbox"]`,
            dcmnt: originalPost,
            errorMessage: `Could not find a checkbox of the original post "${originalId}".`
        });
        const replyCheckbox = API.getElement<Elements.Checkbox>({
            selector: `input[type="checkbox"]`,
            dcmnt: replyPost,
            errorMessage: `Could not find a checkbox of the reply post "${replyPost.id}".`
        });

        if (PageElements.activePosts.has(originalPost)) {
            replyCheckbox.setAttribute("checked", "true");
        }

        replyCheckbox.addEventListener("click", () => {
            originalCheckbox.click()
        });
    }

    /**
     * Binds a checkbox of the new post.
     *
     * @param post The post for checkbox binding.
     */
    protected static commonPostEvent(post: Elements.Post): void {
        Checkboxes.bindCheckboxes(post);
    }
}


/**
 * Handles page elements requests.
 */
export abstract class PageElements {
    protected static _thread: Elements.Thread = undefined;

    /**
     * The thread.
     */
    public static get thread(): Elements.Thread {
        return PageElements._thread;
    }

    /**
     * The active posts of the thread.
     */
    public static get activePosts(): Set<Elements.Post> {
        return Checkboxes.activePosts;
    }

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this._thread = API.getThread();
        Checkboxes.main();
        Observer.main();
    }

    /**
     * Turns off the active posts.
     */
    public static turnOffActivePosts() {
        Checkboxes.turnOffActivePosts();
    }
}
