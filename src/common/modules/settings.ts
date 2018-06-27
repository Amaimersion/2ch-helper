import {UserSettings, StorageSync} from "@modules/storage-sync";
import {API} from "@modules/api";


export abstract class Settings {
    protected static _settings: UserSettings = undefined;

    public static main(): void {
        this.init();
    }

    public static async get(key: string): Promise<UserSettings> {
        if (!this._settings) {
            await this.init();
        }

        return (await API.getSettings(key, this._settings));
    }

    protected static async init(): Promise<void> {
        this._settings = await StorageSync.get(null);
    }
}
