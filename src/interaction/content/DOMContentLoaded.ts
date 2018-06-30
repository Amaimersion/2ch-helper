import {DOMLoaded, Method} from "@modules/dom";
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
        this.run(() => {PageElements.main();});
        this.run(() => {Settings.main();});
        this.run(() => {PageOptions.main();});
        this.run(() => {Statistics.main();});
    }

    /**
     * Runs a method and ignores errors if any.
     *
     * @param method The method for execution.
     */
    protected static run(method: Method): void {
        try {
            method();
        } catch (error) {
            console.error(error);
        }
    }
}


DOMLoaded.run(() => DOMContentLoaded.main());
