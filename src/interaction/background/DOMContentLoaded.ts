import {DOMLoaded} from "@modules/dom";
import {Settings} from "./settings";


/**
 * Handles DOMContentLoaded event.
 */
abstract class DOMContentLoaded {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        Settings.main();
    }
}


DOMLoaded.runFunction(() => DOMContentLoaded.main());
