export interface UserSettings {
    [key: string]: any;
}

abstract class ProfileInfo {
    protected static readonly defaultSettings = {
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
