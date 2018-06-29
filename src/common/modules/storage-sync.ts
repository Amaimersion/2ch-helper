/**
 * Available key for download settings.
 */
export type DownloadKey = (
    "images" | "video"
);

/**
 * Available key for screenshot settings.
 */
export type ScreenshotKey = (
    "posts" | "thread"
);

/**
 * User settings object.
 */
export interface UserSettings {
    [key: string]: any;
}

/**
 * Default user settings object.
 */
interface DefaultSettings {
    /**
     * The settings for screenshot.
     */
    settingsScreenshot: {
        [key: string]: {
            /**
             * A name of the file.
             */
            name: string,
            /**
             * A format of the file.
             */
            format: "jpg" | "png",
            /**
             * A quality of the file.
             */
            quality: number,
            /**
             * A background fill color of the file.
             */
            fillColor: string,
            /**
             * A height of the background at the top.
             */
            paddingTop: number,
            /**
             * A height of the background at the bottom.
             */
            paddingBottom: number,
            /**
             * A height of the background at the left.
             */
            paddingLeft: number,
            /**
             * A height of the background at the right.
             */
            paddingRight: number,
            /**
             * A height between images.
             */
            paddingBetween?: number,
            /**
             * Turn off posts after screenshot get taken.
             */
            turnOffPosts?: boolean
        }
    },

    /**
     * The settings for download.
     */
    settingsDownload: {
        [key: string]: {
            /**
             * Determine name of the file.
             */
            autoFileName: boolean,
            /**
             * A name of the file.
             * If `autoFileName` is `true`, then is doesn'a affected.
             */
            fileName: string,
            /**
             * A delay between downloads.
             */
            delay?: number,
            /**
             * A types for download.
             * Should not contain a dot symbol.
             *
             * @example
             * ["jpg", "png"]
             */
            types?: string[]
        }
    }
}

/**
 * Initial user settings object.
 */
interface InitialSettings extends DefaultSettings {
    /**
     * Statistics values.
     */
    statistics: {
        /**
         * How many time user spent on the imageboard.
         * In milliseconds.
         */
        totalSpent: number
    },

    /**
     * Indicates that the settings have been successfully created.
     */
    isExists: boolean
}

/**
 * Information about the user profile.
 */
abstract class ProfileInfo {
    protected static readonly _defaultSettings: DefaultSettings = {
        settingsScreenshot: {
            posts: {
                name: "posts",
                format: "jpg",
                quality: 100,
                turnOffPosts: true,
                fillColor: "#EEE",
                paddingTop: 6,
                paddingBottom: 6,
                paddingLeft: 6,
                paddingRight: 6,
                paddingBetween: 4
            },
            thread: {
                name: "thread",
                format: "jpg",
                quality: 100,
                fillColor: "#EEE",
                paddingTop: 6,
                paddingBottom: 6,
                paddingLeft: 6,
                paddingRight: 6
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
        }
    };

    protected static readonly _initialSettings: InitialSettings = {...ProfileInfo._defaultSettings,
        statistics: {
            totalSpent: 0
        },
        isExists: true
    };
}

/**
 * The sync storage area that synced using Browser Sync technologies.
 */
export abstract class StorageSync extends ProfileInfo {
    /**
     * Gets a settings from the storage.
     *
     * @param key
     * A single key to get, list of keys to get, or a dictionary specifying default values.
     * An empty list or object will return an empty result object.
     * Pass in null to get the entire contents of storage.
     */
    public static get(key: string | string[] | Object | null = null): Promise<UserSettings> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (items) => {
                return resolve(items);
            })
        });
    }

    /**
     * Saves an items in the storage.
     *
     * @param items
     * An object which gives each key/value pair to update storage with.
     * Any other key/value pairs in storage will not be affected.
     * Primitive values such as numbers will serialize as expected.
     * Values with a typeof "object" and "function" will typically serialize to {},
     * with the exception of Array (serializes as expected), Date,
     * and Regex (serialize using their String representation).
     */
    public static set(items: UserSettings): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.set(items, () => {
                return resolve();
            })
        });
    }

    /**
     * Clears the storage.
     */
    public static clear(): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.clear(() => {
                return resolve();
            });
        });
    }

    /**
     * Removes an items from the storage.
     *
     * @param keys Single key or a list of keys for items to remove.
     */
    public static remove(keys: string | string[]): Promise<void> {
        return new Promise((resolve) => {
            chrome.storage.sync.remove(keys, () => {
                return resolve();
            });
        });
    }

    /**
     * Sets an initial settings.
     *
     * @param force
     * Check if settings already exists.
     * If true, then there will be no verification,
     * else will be thrown an error if the settings is exists.
     *
     * @throws
     * Throws an error if `!force && settings`.
     */
    public static async setInitialSettings(force: boolean = false): Promise<void> {
        if (!force) {
            if (await this.isExists()) {
                throw new Error("Attempt to override an existing settings.");
            }
        }

        await this.clear();
        await this.set(this._initialSettings);
    }

    /**
     * Restores default settings.
     *
     * @param force
     * Check if settings already exists.
     * If true, then there will be no verification,
     * else will be thrown an error if the settings is exists.
     *
     * @throws
     * Throws an error if `!force && settings`.
     */
    public static async restoreDefault(force: boolean = false): Promise<void> {
        const keys = Object.keys(this._defaultSettings);

        if (!force) {
            if (await this.isExists(keys)) {
                throw new Error("Attempt to override an existing settings.");
            }
        }

        await this.remove(keys);
        await this.set(this._defaultSettings);
    }

    /**
     * Checks if the settings exists.
     */
    public static async isExists(key: string | string[] | Object | null = undefined): Promise<boolean> {
        if (key) {
            return (await this.get(key) ? true : false);
        } else {
            return (await this.get({isExists: false})).isExists;
        }
    }
}
