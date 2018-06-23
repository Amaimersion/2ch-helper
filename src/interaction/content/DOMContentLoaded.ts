import {DOMLoaded} from "@modules/dom";
import {PageElements} from "./page-elements";
import {Settings} from "./settings";
import {PageOptions} from "./screenshot";


abstract class DOMContentLoaded {
    public static main(): void {
        PageElements.main();
        Settings.main();
        PageOptions.main();
    }
}


DOMLoaded.runFunction(() => DOMContentLoaded.main());
