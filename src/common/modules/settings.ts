import {UserSettings, StorageSync} from "@modules/storage-sync";
import {API} from "@modules/api";


/**
 * The parent for subclasses.
 */
export abstract class Settings {
    protected static _settings: UserSettings = undefined;

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this.init();
    }

    /**
     * Gets the settings for a key.
     *
     * @param key The key by which to search for settings.
     *
     * @returns An object with a properties for the key.
     *
     * @throws Throws an error if the settings for the key is undefined.
     */
    public static async get(key: string): Promise<UserSettings> {
        if (!this._settings) {
            await this.init();
        }

        return (await API.getSettings(key, this._settings));
    }

    /**
     * Gets all user settings from `Sync Storage`.
     */
    protected static async init(): Promise<void> {
        this._settings = await StorageSync.get(null);
    }
}
