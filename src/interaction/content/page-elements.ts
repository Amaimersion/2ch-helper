import {API} from "@modules/api";


abstract class Checkboxes {
    protected static _activePosts: Set<HTMLDivElement> = undefined;

    public static get activePosts(): Set<HTMLDivElement> {
        return Checkboxes._activePosts;
    }

    public static main(): void {
        this._activePosts = new Set<HTMLDivElement>();
        this.bindCheckboxes();
    }

    public static bindCheckboxes(post: HTMLDivElement = undefined): void {
        const checkboxes = API.getElements<HTMLInputElement>({
            selector: `input[type="checkbox"]`,
            dcmnt: post ? post : PageElements.thread,
            errorMessage: "Could not find a thread checkboxes."
        });

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", (event) => {
                if ((event.target as HTMLInputElement).checked) {
                    this.eventForCheckedCheckbox(checkbox);
                } else {
                    this.eventForUncheckedCheckbox(checkbox);
                }
            });
        });
    }

    protected static eventForCheckedCheckbox(checkbox: HTMLInputElement): void {
        const post = this.getPostOfCheckbox(checkbox);
        this.activePosts.add(post);
    }

    protected static eventForUncheckedCheckbox(checkbox: HTMLInputElement): void {
        const post = this.getPostOfCheckbox(checkbox);
        const status = this.activePosts.delete(post);

        if (!status) {
            throw new Error("Could not find a post in the set.");
        }
    }

    protected static getPostOfCheckbox(checkbox: HTMLInputElement): HTMLDivElement {
        const value = checkbox.value;
        const post = API.getElement<HTMLDivElement>({
            selector: `#post-${value}`,
            dcmnt: PageElements.thread,
            errorMessage: `Could not find a post for the value "${value}".`
        });

        return post;
    }

    protected static turnOffActivePosts(): void {
        for (let post of PageElements.activePosts) {
            const checkbox = API.getElement<HTMLInputElement>({
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
        type Element = HTMLElement;
        type Post = HTMLDivElement;

        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (!Observer.isPostNode(node as Element)) {
                    continue;
                }

                if (Observer.isReplyPost(node as Post)) {
                    Observer.replyPostEvent(node as Post);
                } else {
                    Observer.commonPostEvent(node as Post);
                }
            }
        }
    }

    protected static isPostNode(node: HTMLElement): boolean {
        const postTags = ["div"];
        const postId = new RegExp(/((post|preview)-*)/, "");

        return (
            node.tagName &&
            postTags.includes(node.tagName.toLowerCase()) &&
            node.id &&
            postId.test(node.id.toLowerCase())
        );
    }

    protected static isReplyPost(post: HTMLDivElement): boolean {
        const replyPostClasses = ["reply"];

        const containClass = replyPostClasses.some((element) => {
            return post.classList.contains(element);
        });

        return containClass;
    }

    protected static replyPostEvent(replyPost: HTMLDivElement): void {
        const originalId = replyPost.id.replace("preview-", "post-");

        const originalPost = API.getElement<HTMLDivElement>({
            selector: `#${originalId}`,
            dcmnt: PageElements.thread,
            errorMessage: `Could not find an original post with the id "${originalId}".`
        });
        const originalCheckbox = API.getElement<HTMLInputElement>({
            selector: `input[type="checkbox"]`,
            dcmnt: originalPost,
            errorMessage: `Could not find a checkbox of the original post "${originalId}".`
        });
        const replyCheckbox = API.getElement<HTMLInputElement>({
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

    protected static commonPostEvent(post: HTMLDivElement): void {
        Checkboxes.bindCheckboxes(post);
    }
}


export abstract class PageElements {
    protected static _thread: HTMLFormElement = undefined;

    public static get thread(): HTMLFormElement {
        return PageElements._thread;
    }

    public static get activePosts(): Set<HTMLDivElement> {
        return Checkboxes.activePosts;
    }

    public static main(): void {
        this._thread = API.getThread();
        Checkboxes.main();
        Observer.main();
    }
}
