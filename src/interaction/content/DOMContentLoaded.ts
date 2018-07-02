import {DOMLoaded, CheckMethod} from "@modules/dom";
import {PageElements} from "./page-elements";
import {Settings} from "./settings";
import {PageOptions} from "./screenshot";
import {Statistics} from "./statistics";


/**
 * Handles DOMContentLoaded event.
 */
abstract class DOMContentLoaded {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        DOMLoaded.run(() => {PageElements.main()}, true, this.checkForThread);
        DOMLoaded.run(() => {Settings.main()}, true, this.checkForThread);
        DOMLoaded.run(() => {PageOptions.main()}, true, this.checkForThread);
        DOMLoaded.run(() => {Statistics.main()}, true);
    }

    /**
     * Checks if a current page is a thread.
     */
    protected static checkForThread: CheckMethod = (location) => {
        // (?<protocol>.*)(?<host>2ch\.hk)(?<board>\/.*\/)(?<resource>res\/)(?<thread>.*)(?<format>\.html)
        const regexp = new RegExp(/(.*)(2ch\.hk)(\/.*\/)(res\/)(.*)(\.html)/, "");

        return regexp.test(location.href);
    }
}


DOMLoaded.run(() => {DOMContentLoaded.main();});
