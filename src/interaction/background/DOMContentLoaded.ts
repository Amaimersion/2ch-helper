import {DOMLoaded, Method} from "@modules/dom";
import {Settings} from "./settings";


/**
 * Handles DOMContentLoaded event.
 */
abstract class DOMContentLoaded {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        this.run(() => {Settings.main()});
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
