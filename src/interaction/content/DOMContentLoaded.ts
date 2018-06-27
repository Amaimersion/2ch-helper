import {DOMLoaded} from "@modules/dom";
import {PageElements} from "./page-elements";
import {Settings} from "./settings";
import {PageOptions} from "./screenshot";


/**
 * Handles DOMContentLoaded event.
 */
abstract class DOMContentLoaded {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        PageElements.main();
        Settings.main();
        PageOptions.main();
    }
}


DOMLoaded.runFunction(() => DOMContentLoaded.main());
