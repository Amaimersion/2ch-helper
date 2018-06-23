import {AvailableDownloadKey, UserSettings} from "@modules/storage-sync";
import {API} from "@modules/api";


export abstract class Download {
    private static settings: UserSettings = undefined;

    public static async links(links: string[], settingId: AvailableDownloadKey): Promise<void> {
        if (!this.settings) {
            this.settings = await this.getSettings();
        }

        for (let link of links) {
            let downloadParameters: chrome.downloads.DownloadOptions = {
                url: link
            };

            if (!this.settings[settingId].autoFileName) {
                const name = this.settings[settingId].fileName;
                const type = this.getFileFormat(link);
                downloadParameters.filename = `${name}${type}`;
            }

            await new Promise((resolve) => {
                chrome.downloads.download(downloadParameters, async () => {
                    await API.createTimeout(this.settings[settingId].delay);
                    return resolve();
                });
            });
        }
    }

    public static async thread(): Promise<void> {
        if (!this.settings) {
            this.settings = await this.getSettings();
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

            if (this.settings.thread.autoFileName) {
                name = activeTab.title;
            } else {
                name = this.settings.thread.fileName;
            }

            name = this.fixFileName(name);

            return new RegExp(/\.mhtml$/, "m").test(name) ? name : `${name}.mhtml`;
        };

        const downloadOptions: chrome.downloads.DownloadOptions = {
            url: await getMHTML(),
            filename: getFileName()
        };

        await new Promise((resolve) => {
            chrome.downloads.download(downloadOptions, () => {
                return resolve();
            });
        });
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
