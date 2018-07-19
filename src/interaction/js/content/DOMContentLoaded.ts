import {DOMLoaded, CheckMethod} from "@modules/dom";
import {Script} from "@modules/communication";
import {API} from "@modules/api";
import {Settings as ParentSettings} from "@modules/settings";
import {PageElements} from "./page-elements";
import {Settings} from "./settings";
import {PageOptions} from "./screenshot";
import {Statistics} from "./statistics";
import {TitleGeneration, CustomForms} from "./title-generation";
import {Notifications} from "./notifications";


/**
 * Handles DOMContentLoaded event.
 */
abstract class DOMContentLoaded {
    /**
     * Runs when the `*://2ch.hk/*` is loaded.
     */
    public static main(): void {
        DOMLoaded.run(() => {Statistics.main()}, true);

        DOMLoaded.run(() => {Settings.main()}, true, this.checkForThread);
        DOMLoaded.run(() => {PageElements.main()}, true, this.checkForThread);
        DOMLoaded.run(() => {PageOptions.main()}, true, this.checkForThread);
        DOMLoaded.run(() => {Notifications.main()}, true, this.checkForThread);
        DOMLoaded.run(async () => {
            const settings = await ParentSettings.get("settingsOther");

            if (!settings.other.exifButtonNearFile) {
                return;
            }

            const response = await Script.Content.sendMessageToBackground({
                type: "command",
                command: "injectJS",
                data: {
                    injectDetails: {
                        // `.min` only in production.
                        // without `.min` only in dev.
                        // i should fix this variability in the future versions.
                        file: "/interaction/js/exif.min.js"
                    }
                }
            });

            if (API.isErrorResponse(response)) {
                throw new Error(response.errorText || "Cannot inject a `exif.js`.");
            }
        }, true, this.checkForThread);

        DOMLoaded.run(() => {TitleGeneration.main()}, true, this.checkForBoard);
        DOMLoaded.run(() => {CustomForms.main()}, true, this.checkForBoard);
    }

    /**
     * Checks if a current page is a thread.
     */
    protected static checkForThread: CheckMethod = (location) => {
        // (?<protocol>.*)(?::\/\/)(?<host>2ch)(?:\.)(?<domain>.*)(?<board>\/.*\/)(?:res\/)(?<thread>.*)(?<format>\..*)
        const regexp = new RegExp(/(.*)(:\/\/)(2ch)(\.)(.*)(\/.*\/)(res\/)(.*)(\..*)/, "");
        return regexp.test(location.href);
    }

    protected static checkForBoard: CheckMethod = (location) => {
        // (?<protocol>.*)(?::\/\/)(?<host>2ch)(?:\.)(?<domain>[^\/]*)\/(?<board>\w*)(\/?)(#?)$
        const regexp = new RegExp(/(.*)(:\/\/)(2ch)(\.)([^\/]*)\/(\w*)(\/?)(#?)$/, "m");
        return regexp.test(location.href);
    }
}


DOMLoaded.run(() => {DOMContentLoaded.main()});
