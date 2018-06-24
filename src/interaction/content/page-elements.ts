import {API} from "@modules/api";


export namespace Elements {
    export type Thread = HTMLFormElement;
    export type Element = HTMLElement;
    export type Post = HTMLDivElement;
    export type Checkbox = HTMLInputElement;
}


abstract class Checkboxes {
    protected static _activePosts: Set<Elements.Post> = undefined;

    public static get activePosts(): Set<Elements.Post> {
        return Checkboxes._activePosts;
    }

    public static main(): void {
        this._activePosts = new Set<Elements.Post>();
        this.bindCheckboxes();
    }

    public static bindCheckboxes(post: Elements.Post = undefined): void {
        const checkboxes = API.getElements<Elements.Checkbox>({
            selector: `input[type="checkbox"]`,
            dcmnt: post ? post : PageElements.thread,
            errorMessage: "Could not find a thread checkboxes."
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

    protected static eventForCheckedCheckbox(checkbox: Elements.Checkbox): void {
        const post = this.getPostOfCheckbox(checkbox);
        this.activePosts.add(post);
    }

    protected static eventForUncheckedCheckbox(checkbox: Elements.Checkbox): void {
        const post = this.getPostOfCheckbox(checkbox);
        const status = this.activePosts.delete(post);

        if (!status) {
            throw new Error("Could not find a post in the set.");
        }
    }

    protected static getPostOfCheckbox(checkbox: Elements.Checkbox): Elements.Post {
        const value = checkbox.value;
        const post = API.getElement<Elements.Post>({
            selector: `#post-body-${value}`,
            dcmnt: PageElements.thread,
            errorMessage: `Could not find a post for the value "${value}".`
        });

        return post;
    }

    protected static turnOffActivePosts(): void {
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
}


abstract class Observer {
    public static main(): void {
        this.bindObserver();
    }

    protected static bindObserver(): void {
        const config: MutationObserverInit = {
            subtree: true,
            childList: true
        };
        const observer = new MutationObserver(this.observerEvent);

        observer.observe(PageElements.thread, config);
    }

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

    protected static isReplyPost(post: Elements.Post): boolean {
        const replyPostClasses = ["reply"];

        const containClass = replyPostClasses.some((element) => {
            return post.classList.contains(element);
        });

        return containClass;
    }

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

    protected static commonPostEvent(post: Elements.Post): void {
        Checkboxes.bindCheckboxes(post);
    }
}


export abstract class PageElements {
    protected static _thread: Elements.Thread = undefined;

    public static get thread(): Elements.Thread {
        return PageElements._thread;
    }

    public static get activePosts(): Set<Elements.Post> {
        return Checkboxes.activePosts;
    }

    public static main(): void {
        this._thread = API.getThread();
        Checkboxes.main();
        Observer.main();
    }
}
