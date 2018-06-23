export type AvailableDownloadKey = (
    "images" | "video"
);

export interface UserSettings {
    [key: string]: any;
}

export interface UserSettingsDefault {
    settingsDownload: {
        [key: string]: {
            autoFileName: boolean,
            fileName: string,
            delay?: number,
            types?: string[]
        }
    },
    isExists: boolean
}

abstract class ProfileInfo {
    protected static readonly defaultSettings: UserSettingsDefault = {
        settingsDownload: {
            images: {
                autoFileName: true,
                fileName: "image",
                delay: 500,
                types: ["jpg", "jpeg", "png", "gif"]
            },
            video: {
                autoFileName: true,
                fileName: "video",
                delay: 500,
                types: ["webm", "mp4"]
            },
            thread: {
                autoFileName: true,
                fileName: "thread"
            }
        },
        isExists: true
    };
}

export abstract class StorageSync extends ProfileInfo {
    public static get(key: string | string[] | Object | null = null): Promise<UserSettings> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (items) => {
                return resolve(items);
            })
        });
    }

    public static set(items: UserSettings): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(items, () => {
                return resolve();
            })
        });
    }

    public static clear(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.clear(() => {
                return resolve();
            });
        });
    }

    public static async restoreDefault(force: boolean = false): Promise<void> {
        if (!force) {
            if (await this.isExists()) {
                throw new Error("Attempt to override an existing settings.");
            }
        }

        await this.clear();
        await this.set(this.defaultSettings);
    }

    public static async isExists(): Promise<boolean> {
        return (await this.get({isExists: false})).isExists;
    }
}
