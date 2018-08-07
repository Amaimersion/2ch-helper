import {API} from "@modules/api";
import {Script} from "@modules/communication";
import {Settings} from "@modules/settings";
import {UserSettings} from "@modules/storage-sync";


/**
 * Page elements.
 */
export namespace Elements {
    export type Thread = HTMLFormElement;
    export type Element = HTMLElement;
    export type Post = HTMLDivElement;
    export type Checkbox = HTMLInputElement;
    export type Image = HTMLImageElement;
    export type Video = HTMLVideoElement;
    export type Link = HTMLLinkElement;
}


/**
 * Custom classes that will be added to the page.
 */
interface CustomClasses {
    commonButton: string;
    downloadButton: string;
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
    private static _settings: UserSettings = undefined;

    /**
     * Runs when the page is loaded.
     */
    public static async main(): Promise<void> {
        this._settings = await Settings.get("settingsOther");
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

                if (Observer._settings.expandImageWhenTarget) {
                    Images.bindExpand(node as Elements.Element);
                }

                if (Observer._settings.downloadButtonNearFile) {
                    Custom.createDownloadButtons(node as Elements.Post);
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
 * Handles images.
 */
abstract class Images {
    /**
     * Runs when the page is loaded.
     */
    public static async main(): Promise<void> {
        const settings = await Settings.get("settingsOther");

        if (!settings.other.expandImageWhenTarget) {
            return;
        }

        this.bindExpand();
    }

    /**
     * Binds an expand event for all finded preview images.
     *
     * @param element
     * The element for all preview images finding.
     * Defaults to `PageElements.thread`.
     */
    public static bindExpand(element: Elements.Element = PageElements.thread): void {
        let previewImages: NodeListOf<Elements.Image> = undefined;

        try {
            previewImages = API.getElements<Elements.Image>({
                selector: "img.preview",
                dcmnt: element,
                errorMessage: "Could not find a preview images."
            });
        } catch (error) {
            console.warn(error);
            return;
        }

        /**
         * Finds an original element by src.
         *
         * @param src The src for finding.
         * @returns Either video or image.
         * @throws Throws an error if could not find.
         */
        const getOriginalElement = (src: string): Elements.Video | Elements.Image => {
            if (RegExp(/((webm|mp4)$)/, "m").test(src)) {
                return API.getElement<Elements.Element>({
                    selector: `source[src="${src}"]`,
                    errorMessage: "Could not find a source of video."
                }).parentElement as Elements.Video;
            } else {
                return API.getElement<Elements.Image>({
                    selector: `img[src="${src}"]`,
                    errorMessage: "Could not find an original image."
                });
            }
        };

        previewImages.forEach((previewImage) => {
            const parent = previewImage.parentElement as Elements.Link;
            const originalSrc = parent.href.replace(window.location.origin, "");

            if (!originalSrc) {
                console.warn("Original href is empty or undefined.");
                return;
            }

            previewImage.addEventListener("mouseenter", () => {
                previewImage.click();
                let originalElement: Elements.Video | HTMLImageElement = undefined;

                try {
                    originalElement = getOriginalElement(originalSrc);
                } catch (error) {
                    console.warn(error);
                    return;
                }

                const originalLeaveEvent = () => {
                    previewImage.click();
                };

                const originalClickEvent = () => {
                    originalElement.removeEventListener("mouseleave", originalLeaveEvent);
                }

                originalElement.addEventListener("mouseleave", originalLeaveEvent);
                originalElement.addEventListener("click", originalClickEvent);
            });
        });
    }
}


/**
 * Handles custom changes.
 */
abstract class Custom {
    /**
     * The name of classes that will be appended to the custom elements.
     */
    public static readonly elementsClasses: CustomClasses = {
        commonButton: "custom-2ch-helper-image-button",
        downloadButton: "custom-2ch-helper-download-button"
    };

    /**
     * Runs when the page is loaded.
     */
    public static async main(): Promise<void> {
        const settings = await Settings.get("settingsOther");

        if (!settings.other.downloadButtonNearFile) {
            return;
        }

        this.createDownloadButtons();
    }

    /**
     * Creates download buttons for media elements.
     *
     * @param element
     * The element for media finding.
     * Defaults to `PageElements.thread`.
     */
    public static createDownloadButtons(element: Elements.Element = PageElements.thread): void {
        let figures: NodeListOf<Elements.Element> = undefined;

        try {
            figures = API.getElements<Elements.Element>({
                dcmnt: element,
                selector: "figure.image",
                errorMessage: "Could not find a figure elements."
            });
        } catch (error) {
            console.warn(error);
            return;
        }

        figures.forEach((figure) => {
            const alreadyExists = figure.querySelector(`.${this.elementsClasses.downloadButton}`);

            // For preview posts click event not working.
            // So, we will re-create it.
            if (alreadyExists) {
                alreadyExists.innerHTML = "";
            }

            let span: Elements.Element = undefined;
            let href: string = undefined;

            try {
                span = API.getElement<Elements.Element>({
                    dcmnt: figure,
                    selector: "span",
                    errorMessage: "Could not find a span."
                });
            } catch (error) {
                console.warn(error);
                return;
            }

            try {
                href = API.getElement<Elements.Link>({
                    dcmnt: figure,
                    selector: "a",
                    errorMessage: "Could not find a link."
                }).href;
            } catch (error) {
                console.warn(error);
                return;
            }

            const div = document.createElement("div");
            const a = document.createElement("a");
            const img = document.createElement("img");

            div.classList.add(this.elementsClasses.commonButton);
            div.classList.add(this.elementsClasses.downloadButton);
            div.id = `${this.elementsClasses.downloadButton}-${API.generateHash()}`;

            a.id = `${this.elementsClasses.downloadButton}-${API.generateHash()}`;

            img.id = `${this.elementsClasses.downloadButton}-${API.generateHash()}`;
            img.src = chrome.extension.getURL("/interaction/assets/images/font-awesome/arrow-alt-circle-down-solid.svg");
            img.alt = "Save";

            // Custom set because when download a `mhtml` file the injected style
            // will disappear and images become very large. To prevent this behaviour
            // we set height manually. It uses height from a `custom-thread.scss`.
            img.style.height = "1.55vh";

            img.addEventListener("click", async () =>{
                const response = await Script.Content.sendMessageToBackground({
                    type: "command",
                    command: "downloadLinks",
                    data: {
                        links: [href],
                        type: new RegExp(/((webm|mp4)$)/, "m").test(href) ? "video" : "images"
                    }
                });

                if (API.isErrorResponse(response)) {
                    throw new Error(response.errorText || `Could not download ${href}`);
                }
            });

            div.appendChild(a);
            a.appendChild(img);
            span.parentElement.insertBefore(div, span);
        });
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
     * The custom classes.
     */
    public static get customClasses(): CustomClasses {
        return Custom.elementsClasses;
    }

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this._thread = API.getThread();
        Checkboxes.main();
        Observer.main();
        Images.main();
        Custom.main();
    }

    /**
     * Turns off the active posts.
     */
    public static turnOffActivePosts() {
        Checkboxes.turnOffActivePosts();
    }
}
