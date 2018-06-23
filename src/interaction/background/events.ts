import {StorageSync} from "@modules/storage-sync";


abstract class Events {
    public static async onFirstInstall(): Promise<void> {
        await StorageSync.restoreDefault(true);
    }
}


chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        Events.onFirstInstall();
    }

    // only in dev mode.
    else if (details.reason === "update") {
        Events.onFirstInstall();
    }
});
