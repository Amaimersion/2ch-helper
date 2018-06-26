import {DOMLoaded} from "@modules/dom";
import {Settings} from "./settings";


abstract class DOMContentLoaded {
    public static main(): void {
        Settings.main();
    }
}


DOMLoaded.runFunction(() => DOMContentLoaded.main());
