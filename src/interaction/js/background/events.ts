import {StorageSync} from "@modules/storage-sync";
import {DOMContentLoaded} from "./DOMContentLoaded";

/**
 * Handles browser events.
 */
abstract class Events {
    /**
     * Runs when the extension is first installed.
     */
    public static async onFirstInstall(): Promise<void> {
        await StorageSync.setInitialSettings(true);
        DOMContentLoaded.main();
    }
}


chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        Events.onFirstInstall();
    }

    /*
    // only in dev mode.
    else if (details.reason === "update") {
        Events.onFirstInstall();
    }
    */
});
