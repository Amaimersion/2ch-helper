import {DOMLoaded} from "@modules/dom";
import {PageElements} from "./page-elements";
import {Settings} from "./settings";


abstract class DOMContentLoaded {
    public static main(): void {
        PageElements.main();
        Settings.main();
    }
}


DOMLoaded.runFunction(() => DOMContentLoaded.main());
