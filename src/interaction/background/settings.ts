import {UserSettings, StorageSync} from "@modules/storage-sync";
import {API} from "@modules/api";


export abstract class Settings {
    private static settings: UserSettings = undefined;

    public static main(): void {
        this.init();
    }

    public static async get(key: string): Promise<UserSettings> {
        if (!this.settings) {
            await this.init();
        }

        return (await API.getSettings(key, this.settings));
    }

    protected static async init(): Promise<void> {
        this.settings = await StorageSync.get(null);
    }
}
