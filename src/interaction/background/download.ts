import {DownloadKey, UserSettings} from "@modules/storage-sync";
import {API} from "@modules/api";
import {Settings} from "./settings";


/**
 * Handles download requests.
 */
export abstract class Download {
    private static _settings: UserSettings = undefined;

    /**
     * Executes download with the parameters.
     *
     * @param parameters The parameters for download.
     */
    public static download(parameters: chrome.downloads.DownloadOptions): Promise<void> {
        return new Promise((resolve) => {
            chrome.downloads.download(parameters, () => {
                return resolve();
            })
        });
    }

    /**
     * Executes download of the links.
     *
     * @param links The links URL's for download.
     * @param settingKey The key of the download settings.
     */
    public static async links(links: string[], settingKey: DownloadKey): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        for (let link of links) {
            let downloadParameters: chrome.downloads.DownloadOptions = {
                url: link
            };

            if (!this._settings[settingKey].autoFileName) {
                const name = this._settings[settingKey].fileName;
                const type = this.getFileFormat(link);
                downloadParameters.filename = `${name}${type}`;
            }

            await this.download(downloadParameters);
            await API.createTimeout(this._settings[settingKey].delay);
        }
    }

    /**
     * Executes download of the thread.
     */
    public static async thread(): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        const activeTab = await API.getActiveTab();

        /**
         * Gets the MHTML content of the active page.
         */
        const getMHTML = (): any => {
            return new Promise<any>((resolve) => {
                chrome.pageCapture.saveAsMHTML({tabId: activeTab.id}, (data) => {
                    return resolve(URL.createObjectURL(data));
                });
            });
        };
        /**
         * Gets the name of the active page.
         */
        const getFileName = (): string => {
            let name = undefined;

            if (this._settings.thread.autoFileName) {
                name = activeTab.title;
            } else {
                name = this._settings.thread.fileName;
            }

            name = this.fixFileName(name);

            return new RegExp(/\.mhtml$/, "m").test(name) ? name : `${name}.mhtml`;
        };

        const downloadOptions: chrome.downloads.DownloadOptions = {
            url: await getMHTML(),
            filename: getFileName()
        };

        await this.download(downloadOptions);
    }

    /**
     * Updates a current user settings.
     */
    public static async updateSettings(): Promise<void> {
        this._settings = await this.getSettings();
    }

    /**
     * Gets an user settings for the `settingsDownload` key.
     */
    protected static getSettings(): Promise<UserSettings> {
        return Settings.get("settingsDownload");
    }

    /**
     * Removes invalid characters for the file name.
     *
     * @param name The name for fix.
     * @param char The character for replace. Defaults to `""`.
     */
    protected static fixFileName(name: string, char: string = ""): string {
        return name.replace(/[\\\/\:\*\?\"\<\>\|]/g, char);
    }

    /**
     * Gets the format of the name.
     *
     * @param name The name for identification.
     *
     * @example
     * name = "www.link.com/image.jpg";
     * Returns: ".jpg"
     */
    protected static getFileFormat(name: string): string {
        const lastIndex = name.lastIndexOf(".");
        return lastIndex !== -1 ? name.slice(lastIndex) : "";
    }
}
