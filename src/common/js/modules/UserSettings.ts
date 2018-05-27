interface Settings {
    [key: string]: any;
}

export abstract class UserSettings {
    protected static userSettings: Settings = {};

    public static async initUserSettings(key: string | Object | string[]): Promise<void> {
        const userData = await this.getUserSettings(key);

        if (!userData)
            console.warn(`User data for the key "${key}" is empty.`);

        this.userSettings = {...this.userSettings, ...userData};
    }

    public static getUserSettings(key: string | Object | string[]): Promise<Settings> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (data) => {
                return resolve(data);
            });
        });
    }

    public static getValueOfUserSetting(mainField: string, field: string): any {
        return this.userSettings[mainField][field];
    }

    public static saveUserSettings() {
        chrome.storage.sync.set(this.userSettings);
    }
}
