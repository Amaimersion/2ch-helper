import {Script} from "@modules/communication";
import {API} from "@modules/api";
import {DownloadKey, UserSettings} from "@modules/storage-sync";
import {PageElements} from "./page-elements";
import {Settings} from "./settings";


/**
 * Handles download requests.
 */
export abstract class Download {
    private static _settings: UserSettings = undefined;

    /**
     * Starts download of images.
     */
    public static images(): Promise<void> {
        return this.handleDownload("images");
    }

    /**
     * Starts download of video.
     */
    public static video(): Promise<void> {
        return this.handleDownload("video");
    }

    /**
     * Starts download of both images and video.
     */
    public static async media(): Promise<void> {
        await this.images();
        await this.video();
    }

    /**
     * Starts download of thread.
     */
    public static async thread(): Promise<void> {
        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "downloadThread"
        });

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || "The background script cannot download the thread.");
        }
    }

    /**
     * Updates a current user settings.
     */
    public static async updateSettings(): Promise<void> {
        this._settings = await this.getSettings();
    }

    /**
     * Handles download of an elements.
     *
     * @param settingKey The key of the download settings.
     */
    protected static async handleDownload(settingKey: DownloadKey): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        const query = this.createTypesQuery(this._settings[settingKey].types);
        let pageLinks: NodeListOf<HTMLLinkElement> = undefined;

        try {
            pageLinks = API.getElements<HTMLLinkElement>({
                selector: query,
                dcmnt: PageElements.thread
            });
        } catch (error) {
            console.warn("Could not find a links in the thread.");
            return;
        }

        const hrefs: Set<string> = new Set();

        for (let pageLink of pageLinks) {
            hrefs.add(pageLink.href);
        }

        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "downloadLinks",
            data: {
                links: Array.from(hrefs),
                type: settingKey
            }
        });

        if (API.isErrorResponse(response)) {
            throw new Error(
                response.errorText || `The background script cannot download links for the key "${settingKey}".`
            );
        }
    }

    /**
     * Gets an user settings for the `settingsDownload` key.
     */
    protected static getSettings(): Promise<UserSettings> {
        return Settings.get("settingsDownload");
    }

    /**
     * Creates a query selector for search of links with the certain type.
     *
     * @param types The types for search. Should not contain a dot symbol.
     *
     * @example
     * types = ["jpg", "jpeg", "png", "gif"];
     * Returns: `a[href$=".jpg"],a[href$=".jpeg"],a[href$=".png"],a[href$=".gif"]`
     */
    protected static createTypesQuery(types: string[]): string {
        let query = "";

        for (let type of types) {
            query += `a[href$=".${type}"],`;
        }

        if (query) {
            query = query.slice(0, query.length - 1);
        }

        return query;
    }
}
