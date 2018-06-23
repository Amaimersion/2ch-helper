import {Script} from "@modules/communication";
import {API} from "@modules/api";
import {AvailableDownloadKey, UserSettings} from "@modules/storage-sync";
import {Settings} from "./settings";


export abstract class Download {
    private static settings: UserSettings = undefined;

    public static images(): Promise<void> {
        return this.handleDownload("images");
    }

    public static video(): Promise<void> {
        return this.handleDownload("video");
    }

    public static async media(): Promise<void> {
        await this.images();
        await this.video();
    }

    public static async thread(): Promise<void> {
        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "downloadThread"
        });

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || `Cannot handle download of thread.`);
        }
    }

    protected static async handleDownload(settingId: AvailableDownloadKey): Promise<void> {
        if (!this.settings) {
            this.settings = await this.getSettings();
        }

        const thread = API.getThread();
        const query = this.createTypesQuery(this.settings[settingId].types);
        let pageLinks: NodeListOf<HTMLLinkElement> = undefined;

        try {
            pageLinks = API.getElements<HTMLLinkElement>({
                selector: query,
                dcmnt: thread
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
                type: settingId
            }
        });

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || `Cannot handle download for "${settingId}".`);
        }
    }

    protected static getSettings(): Promise<UserSettings> {
        return Settings.get("settingsDownload");
    }

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
