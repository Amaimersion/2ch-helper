// rename.
export type AvailableDownloadKey = (
    "images" | "video"
);

export type ScreenshotKey = (
    "posts" | "thread"
);

export interface UserSettings {
    [key: string]: any;
}

export interface UserSettingsDefault {
    settingsScreenshot: {
        [key: string]: {
            name: string,
            format: "jpg" | "png",
            quality: number,
            fillColor: string,
            paddingTop: number,
            paddingBottom: number,
            paddingLeft: number,
            paddingRight: number,
            paddingBetween?: number,
            turnOffPosts?: boolean
        }
    }
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
        settingsScreenshot: {
            /* TODO
             * 1) https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element#answer-11585939
             * 2) Turn off user posts highlight.
             */
            posts: {
                name: "posts",
                format: "jpg",
                quality: 100,
                turnOffPosts: true,
                fillColor: "#EEE",
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
                paddingBetween: 4
            },
            thread: {
                name: "thread",
                format: "jpg",
                quality: 100,
                fillColor: "#EEE",
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8
            }
        },
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
