/**
 * @description Implemented for usage as an injected script.
 */


import * as EXIF from "exif-js";
import {DOMLoaded} from "@modules/dom";
import {API} from "@modules/api";


/**
 * Custom classes that will be added to the custom elements.
 */
interface CustomClasses {
    commonButton: string;
    infoButton: string;
    exifPanel: string;
    exifHeader: string;
    exifMain: string;
    exifLoader: string;
}


/**
 * Custom elements that will be added to the page.
 */
interface ExifPanel {
    panel: HTMLDivElement;
    main: HTMLDivElement;
    loader: HTMLDivElement;
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

                Exif.bindFigures(node as HTMLElement);
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
        const postId = new RegExp(/((post|preview)-*)/, "");

        return (
            node.tagName &&
            postTags.includes(node.tagName.toLowerCase()) &&
            node.id &&
            postId.test(node.id.toLowerCase())
        );
    }
}


/**
 * Handles a cached data.
 */
class Cache {
    private _cache: Object = undefined;

    /**
     * Creates an instance of Cache.
     */
    constructor() {
        this._cache = {};
    }

    /**
     * Checks if a key is exists in the cache.
     *
     * @param key The key for checking.
     */
    public isExists(key: string): boolean {
        return this._cache.hasOwnProperty(key);
    }

    /**
     * Gets the value by the key.
     *
     * @param key The key for value.
     *
     * @throws Throws an error if the key don"t exists in the cache.
     */
    public get<T>(key: string): T {
        if (!this.isExists(key)) {
            throw new Error("Key is not exists.");
        }

        return this._cache[key];
    }

    /**
     * Adds a key-value pair in the cache.
     *
     * @param key The key for value.
     * @param value The value of key.
     *
     * @throws Throws an error if the key is already exists.
     */
    public add(key: string, value: any): void {
        if (this.isExists(key)) {
            throw new Error("Key already exists.");
        }

        this._cache[key] = value;
    }
}


/**
 * Handles exif requests.
 */
abstract class Exif {
    /**
     * The name of classes that will be appended to the custom elements.
     */
    public static readonly elementsClasses: CustomClasses = {
        commonButton: "custom-2ch-helper-image-button",
        infoButton: "custom-2ch-helper-info-button",
        exifPanel: "custom-2ch-helper-exif-panel",
        exifHeader: "custom-2ch-helper-exif-header",
        exifMain: "custom-2ch-helper-exif-main",
        exifLoader: "custom-2ch-helper-exif-loader"
    };

    protected static _form: ExifPanel = undefined;
    protected static _cache: Cache = undefined;

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this.bindFigures();
        Observer.main();
        this._cache = new Cache();
    }

    /**
     * Binds a figures (`.figure`) elements.
     *
     * @param element
     * An element for binding.
     * Defaults to `API.getThread()`.
     */
    public static bindFigures(element: HTMLElement = API.getThread()): void {
        const figures = element.querySelectorAll<HTMLElement>("figure.image");

        figures.forEach((figure) => {
            this.bindFigure(figure);
        });
    }

    /**
     * Binds a figure (`.figure`) element.
     *
     * @param figure The element for binding.
     */
    protected static bindFigure(figure: HTMLElement): void {
        const originalSrc = API.getElement<HTMLLinkElement>({
            dcmnt: figure,
            selector: `figcaption > a[target="_blank"]`,
            errorMessage: "Could not find an original link."
        }).href;
        const spanFileSize = API.getElement<HTMLSpanElement>({
            dcmnt: figure,
            selector: "figcaption > span.filesize",
            errorMessage: "Could not find a span."
        });

        if (!this.isAllowedType(originalSrc)) {
            return;
        }

        const alreadyExists = figure.querySelector(`.${this.elementsClasses.infoButton}`);

        // For preview posts click event not working.
        // So, we will re-create it.
        if (alreadyExists) {
            alreadyExists.innerHTML = "";
        }

        const div = document.createElement("div");
        const a = document.createElement("a");
        const img = document.createElement("img");

        div.classList.add(this.elementsClasses.commonButton);
        div.classList.add(this.elementsClasses.infoButton);
        div.id = `${this.elementsClasses.infoButton}-${API.generateHash()}`;

        a.id = `${this.elementsClasses.infoButton}-${API.generateHash()}`;

        img.id = `${this.elementsClasses.infoButton}-${API.generateHash()}`;
        img.src = chrome.extension.getURL("/interaction/assets/images/font-awesome/info-circle-solid.svg");
        img.alt = "Info";

        // Custom set because when download a `mhtml` file the injected style
        // will disappear and images become very large. To prevent this behaviour
        // we set height manually. It uses height from a `custom-thread.scss`.
        img.style.height = "1.55vh";

        img.addEventListener("click", () => {
            this.showExif(originalSrc);
        });

        div.appendChild(a);
        a.appendChild(img);
        spanFileSize.parentElement.insertBefore(div, spanFileSize);
    }

    /**
     * Checks if a type of link is allowed type for EXIF.
     *
     * Type can be either `jpg`, or `tiff`, or `wav`.
     *
     * @param src The URL for checking.
     */
    protected static isAllowedType(src: string): boolean {
        const jpg = "jpg|jpeg|jpe|jif|jfif|jfi";
        const tiff = "tiff|tif";
        const wav = "wav|wave";

        return new RegExp(
            `\\.(${jpg}|${tiff}|${wav})$`,
            "mi"
        ).test(src);
    }

    /**
     * Shows an EXIF info on a custom elements.
     *
     * @param src The URL of image for EXIF data.
     */
    protected static async showExif(src: string): Promise<void> {
        if (!this._form) {
            this._form = this.createForm();
        } else {
            // removes old data.
            this._form.main.innerHTML = "";

            this._form.main.style.display = "none";
            this._form.loader.style.display = "block";
        }

        this._form.panel.style.display = "block";

        /**
         * Displays an EXIF data.
         *
         * @param exifData The data for displaying.
         */
        const display = (exifData) => {
            let displayElement: HTMLElement = undefined;

            if (exifData === undefined) {
                displayElement = document.createElement("p");
                displayElement.innerText = "Ошибка.";
            } else if (!Object.keys(exifData).length) {
                displayElement = document.createElement("p");
                displayElement.innerText = "Нет данных.";
            } else {
                displayElement = document.createElement("table");

                for (let key in exifData) {
                    const tr = document.createElement("tr");
                    const td = document.createElement("td");

                    const spanKey = document.createElement("span");
                    spanKey.innerText = key;
                    td.appendChild(spanKey);

                    const spanValue = document.createElement("span");
                    spanValue.innerText = exifData[key];
                    td.appendChild(spanValue);

                    tr.appendChild(td);
                    displayElement.appendChild(tr);
                }
            }

            this._form.main.appendChild(displayElement);
            this._form.loader.style.display = "none";
            this._form.main.style.display = "block";
        };

        if (this._cache.isExists(src)) {
            const exifData = this._cache.get(src);
            display(exifData);
        } else {
            let exifData = undefined;

            try {
                exifData = await this.getExifData(src);
            } catch (error) {
                console.warn(error);
            }

            display(exifData);

            if (exifData !== undefined) {
                this._cache.add(src, exifData);
            }
        }
    }

    /**
     * Gets an EXIF data for the image.
     *
     * Expected that the image has not yet uploaded on the page.
     * So, the URL of image will be loaded and this can take a long time.
     *
     * @param src The URL of image.
     */
    protected static async getExifData(src: string): Promise<Object> {
        return new Promise((resolve) => {
            const image = document.createElement("img");

            image.onload = () => {
                EXIF.getData(image as any, () => {
                    const exifData = EXIF.getAllTags(image);
                    const outputData = {};

                    for (let key in exifData) {
                        let value = exifData[key];
                        const type = typeof value;

                        if (
                            type !== "string" &&
                            type !== "number" &&
                            type !== "object"
                        ) {
                            continue;
                        }

                        // if is fractional.
                        if (type === "object" && value.numerator && value.denominator) {
                            value = `${value.numerator}/${value.denominator} (${value})`;
                        } else if (type === "object") {
                            value = JSON.stringify(value);
                        } else {
                            value = String(value);
                        }

                        value = value.replace(/\r?\n|\r/g, " ").trim();

                        if (!value) {
                            continue;
                        }

                        outputData[key] = value;
                    }

                    return resolve(outputData);
                });
            };

            image.src = src;
        });
    }

    /**
     * Creates a form for EXIF data displaying.
     *
     * By default the main `panel` has style `display: none`,
     * `main` has style `display: none` and
     * `loader` has style `display: block`.
     *
     * @returns Returns the elements by which you can access the form.
     */
    protected static createForm(): ExifPanel {
        const elements: ExifPanel = {
            panel: undefined,
            main: undefined,
            loader: undefined
        };

        const panel = document.createElement("div");
        panel.classList.add(this.elementsClasses.exifPanel);
        panel.id = `${this.elementsClasses.exifPanel}-${API.generateHash()}`;
        panel.style.display = "none";

        const header = document.createElement("div");
        header.classList.add(this.elementsClasses.exifHeader);
        header.id = `${this.elementsClasses.exifHeader}-${API.generateHash()}`;
        const h5 = document.createElement("h5");
        h5.innerText = "EXIF";
        const p = document.createElement("p");
        p.innerText = "x";
        p.addEventListener("click", () => {
            panel.style.display = "none";
        });

        const main = document.createElement("div");
        main.classList.add(this.elementsClasses.exifMain);
        main.id = `${this.elementsClasses.exifMain}-${API.generateHash()}`;
        main.style.display = "none";

        const loader = document.createElement("div");
        loader.classList.add(this.elementsClasses.exifLoader);
        loader.id = `${this.elementsClasses.exifLoader}-${API.generateHash()}`;
        loader.style.display = "block";

        header.appendChild(h5);
        header.appendChild(p);

        panel.appendChild(header);
        panel.appendChild(main);
        panel.appendChild(loader);

        document.body.appendChild(panel);

        elements.panel = panel;
        elements.main = main;
        elements.loader = loader;

        return elements;
    }
}


DOMLoaded.run(() => {Exif.main()});
