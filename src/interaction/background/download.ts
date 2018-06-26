import {DownloadKey, UserSettings} from "@modules/storage-sync";
import {API} from "@modules/api";


export abstract class Download {
    private static _settings: UserSettings = undefined;

    public static download(parameters: chrome.downloads.DownloadOptions): Promise<void> {
        return new Promise((resolve) => {
            chrome.downloads.download(parameters, () => {
                return resolve();
            })
        });
    }

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

    public static async thread(): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        const activeTab = await API.getActiveTab();

        const getMHTML = (): any => {
            return new Promise<any>((resolve) => {
                chrome.pageCapture.saveAsMHTML({tabId: activeTab.id}, (data) => {
                    return resolve(URL.createObjectURL(data));
                });
            });
        };
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

    protected static getSettings(): Promise<UserSettings> {
        return API.getSettings("settingsDownload");
    }

    protected static fixFileName(name: string, char: string = ""): string {
        return name.replace(/[\\\/\:\*\?\"\<\>\|]/g, char);
    }

    protected static getFileFormat(name: string): string {
        const lastIndex = name.lastIndexOf(".");
        return lastIndex !== -1 ? name.slice(lastIndex) : "";
    }
}
