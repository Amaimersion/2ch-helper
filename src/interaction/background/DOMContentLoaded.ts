import {DOMLoaded} from "@modules/dom";
import {Settings} from "./settings";


/**
 * Handles DOMContentLoaded event.
 */
export abstract class DOMContentLoaded {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        DOMLoaded.run(() => {Settings.main()}, true);
    }
}


DOMLoaded.run(() => DOMContentLoaded.main());
