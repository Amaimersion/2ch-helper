import {DOMLoaded} from "@modules/dom";
import {Settings} from "./settings";
import {Notifications} from "./notifications";


/**
 * Handles DOMContentLoaded event.
 */
export abstract class DOMContentLoaded {
    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        DOMLoaded.run(() => {Settings.main()}, true);
        DOMLoaded.run(() => {Notifications.main()}, true);
    }
}


DOMLoaded.run(() => DOMContentLoaded.main());
