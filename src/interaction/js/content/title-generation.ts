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

        observer.observe(document, config);
    }

    /**
     * The event for an observer callback.
     */
    protected static observerEvent: MutationCallback = (mutations) => {
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                const element = node as HTMLElement;

                // if element is a newly added thread.
                if (
                    !element.classList ||
                    !element.classList.contains("thread")
                ) {
                    continue;
                }

                try {
                    TitleGeneration.generateTitle(element);
                } catch (error) {
                    console.warn(error);
                }
            }
        }
    }
}


/**
 * Handles title generation on the board pages.
 * It is implemented for usage only on `*://2ch.hk/*\/` pages.
 */
export abstract class TitleGeneration {
    /**
     * Runs when the page is loaded.
     * It is implemented for usage only on `*://2ch.hk/*\/` pages.
     */
    public static main(): void {
        this.generateTitles();
        Observer.main();
    }

    /**
     * Generates a titles for all finded threads.
     */
    public static generateTitles(): void {
        const threads = API.getElements<HTMLDivElement>({
            selector: "div.thread",
            errorMessage: "Could not find a threads."
        });

        threads.forEach((thread) => {
            this.generateTitle(thread);
        });
    }

    /**
     * Generates a title for a thread.
     *
     * @param thread The thread form.
     */
    public static generateTitle(thread: HTMLElement): void {
        // if already exists.
        if (thread.querySelector(".post-title")) {
            return;
        }

        let title = undefined;

        try {
            title = this.createTitle(thread);
        } catch (error) {
            console.warn(error);
            return;
        }

        const span = document.createElement("span");
        span.classList.add("post-title");
        span.innerText = title;

        const beforeElement = this.getBeforeInsertElement(thread);

        if (beforeElement) {
            beforeElement.parentElement.insertBefore(span, beforeElement);
        } else {
            const postDetails = API.getElement<HTMLElement>({
                dcmnt: thread,
                selector: ".post-details",
                errorMessage: "Could not find a post details elements."
            });
            postDetails.appendChild(span);
        }
    }

    /**
     * Creates a title for a thread.
     *
     * It is a copy function from the `swag.js`.
     * @see https://gist.github.com/Amaimersion/47adaf04588014791e5835e6a5b0e445
     *
     * @param thread The thread.
     */
    protected static createTitle(thread: HTMLElement): string {
        const message = API.getElement<HTMLElement>({
            dcmnt: thread,
            selector: ".post-message",
            errorMessage: "Could not find a post message."
        });

        let title = message.innerText;

        title = this.escapeHTML(title);
        title = this.trim(title);

        if (title.length > 50) {
            title = `${title.substr(0, 50)}`;
            title = title.trim();
            title += "...";
        }

        return title + " ";
    }

    /**
     * Escapes HTML in a string.
     *
     * It is a copy function from the `swag.js`.
     * @see https://gist.github.com/Amaimersion/47adaf04588014791e5835e6a5b0e445
     *
     * @param string The string for escaping.
     */
    protected static escapeHTML(string: string): string {
        return (string + "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Removes the leading and trailing white space, line
     * terminator characters, newlines and tabs from a string.
     *
     * @param string Thr string for triming.
     */
    protected static trim(string: string): string {
        return string.trim().replace(/\r?\n|\r/g, " ");
    }

    /**
     * Gets the element before which to insert the title.
     *
     * @param thread The thread for finding.
     *
     * @returns Returns `undefined` if cannot find.
     */
    protected static getBeforeInsertElement(thread: HTMLElement): HTMLElement {
        const details = thread.querySelector("div.post-details");

        if (!details) return undefined;

        let element = undefined;

        element = details.querySelector(".ananimas");
        if (element) return element;

        element = details.querySelector(".post-email");
        if (element) return element;

        element = details.querySelector(".posttime");
        if (element) return element;

        element = details.querySelector(".reflink");
        if (element) return element;

        element = details.querySelector(".postpanel");
        if (element) return element;

        element = details.querySelector(".desktop");
        if (element) return element;

        return undefined;
    }
}
