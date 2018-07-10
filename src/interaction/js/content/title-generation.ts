import {API} from "@modules/api";


/**
 * Properties of custom form.
 */
interface CustomFormProperties {
    trClass: string;
    labelText: string;
    inputId: string;
    inputPlaceholder: string;
    /**
     * Defaults to `text`.
     */
    inputType?: string;
    /**
     * Will be skipped if undefined.
     */
    inputSize?: number;
    /**
     * Will be skipped if undefined.
     */
    inputMaxLength?: number;
}

/**
 * Creates custom forms for the post form.
 * It is implemented for usage only on `*://2ch.hk/*\/` pages.
 */
export abstract class CustomForms {
    /**
     * Runs when the page is loaded.
     * It is implemented for usage only on `*://2ch.hk/*\/` pages.
     */
    public static main(): void {
        this.appendForms();
    }

    /**
     * Creates custom forms and appends it.
     * If the form already exists, then skips it.
     * Creates this forms: `tr.post-tags`, `tr.post-subject`, `tr.name`.
     */
    protected static appendForms(): void {
        const form = API.getElement<HTMLFormElement>({
            selector: "#postform",
            errorMessage: "Could not find a form."
        });
        const tbody = API.getElement<HTMLElement>({
            dcmnt: form,
            selector: "tbody",
            errorMessage: "Could not find a tbody of the form."
        });
        const commentArea = API.getElement<HTMLElement>({
            dcmnt: tbody,
            selector: "tr.comment-area",
            errorMessage: "Could not find a comment area of tbody."
        });

        let tagsArea = tbody.querySelector("tr.post-tags");
        if (!tagsArea) {
            tagsArea = this.createCustomForm({
                trClass: "post-tags",
                labelText: "Тег",
                inputId: "tags",
                inputPlaceholder: "Максимум 8 символов",
                inputMaxLength: 8
            });
            tbody.insertBefore(tagsArea, commentArea);
        }

        let subjectArea = tbody.querySelector("tr.post-subject");
        if (!subjectArea) {
            subjectArea = this.createCustomForm({
                trClass: "post-subject",
                labelText: "Тема",
                inputId: "subject",
                inputPlaceholder: "Максимум 150 символов",
                inputMaxLength: 150,
            });
            tbody.insertBefore(subjectArea, tagsArea);
        }

        let nameArea = tbody.querySelector("tr.name");
        if (!nameArea) {
            nameArea = this.createCustomForm({
                trClass: "name",
                labelText: "Имя",
                inputId: "name",
                inputPlaceholder: "Имя",
                inputSize: 30
            });
            tbody.insertBefore(nameArea, subjectArea);
        }

    }

    /**
     * Creates a custom form with the given properties.
     *
     * The properties should match the original properties.
     * @see https://gist.github.com/Amaimersion/0960d096af42f9ab8126b1c755902067
     *
     * @param properties The properties of the form.
     */
    protected static createCustomForm(properties: CustomFormProperties): HTMLTableRowElement {
        const tr = document.createElement("tr");
        tr.classList.add(properties.trClass);

        const tdLabel = document.createElement("td");
        tdLabel.classList.add("label");
        tdLabel.classList.add("desktop");
        let label = document.createElement("label");
        label.htmlFor = properties.inputId;
        label.innerText = properties.labelText;
        tdLabel.appendChild(label);
        tr.appendChild(tdLabel);

        const tdInput = document.createElement("td");
        let input = document.createElement("input");
        input.id = properties.inputId;
        input.name = properties.inputId;
        input.placeholder = properties.inputPlaceholder;
        input.type = properties.inputType ? properties.inputType : "text";
        properties.inputSize ? input.size = properties.inputSize : null;
        properties.inputMaxLength ? input.maxLength = properties.inputMaxLength : null;

        tdInput.appendChild(input);
        tr.appendChild(tdInput);

        return this.createCustomDataSet(tr);
    }

    /**
     * Adds custom data set to the element.
     *
     * It is necessary for identification of the custom created form.
     *
     * @param element The element for adding.
     */
    protected static createCustomDataSet<T>(element: T & HTMLElement): T {
        const description = "custom-element-created-by-2ch-helper";

        const addToChilds = (elmnt: T & HTMLElement) => {
            elmnt.childNodes.forEach((node) => {
                if (node.childNodes.length) {
                    addToChilds(node as T & HTMLElement);
                }

                const nodeElement: HTMLElement = node as any;

                if (!nodeElement.dataset) {
                    return;
                }

                nodeElement.dataset.description = description;
            });
        }

        addToChilds(element);
        element.dataset.description = description;

        return element;
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
