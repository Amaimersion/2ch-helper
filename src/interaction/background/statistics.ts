import {StorageSync, UserSettings} from "@modules/storage-sync";
import {Settings} from "@modules/settings";


/**
 * Handles a statistics requests.
 */
export abstract class Statistics {
    private static _settings: UserSettings = undefined;

    /**
     * Updates `totalSpent` field.
     *
     * @param focusOnTime The time when a page is get focus.
     * @param focusOffTime The time when a page is lost focus.
     */
    public static async updateTotalSpent(focusOnTime: number, focusOffTime: number): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        // Double-check for any non-standard cases.
        // (e.g., the browser is get closed and content script sends a wrond data).
        if (
            typeof focusOnTime !== "number" ||
            typeof focusOffTime !== "number"
        ) {
            throw new Error("Focus time is not a number type.");
        }

        const timeSpent = focusOffTime - focusOnTime;
        this._settings.totalSpent += timeSpent;

        await StorageSync.set({"statistics": this._settings});
    }

    /**
     * Gets an user settings for the `statistics` key.
     */
    protected static getSettings(): Promise<UserSettings> {
        return Settings.get("statistics");
    }
}
