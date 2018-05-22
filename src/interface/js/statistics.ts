import {DOMLoaded} from "@modules/dom";
import {Iframe} from "./settings-iframe"; // double export of bootstrap-slider?


abstract class Statistics {
    public static userSettingId = "statistics";

    public static async main(): Promise<void> {
        await Iframe.initUserSettings(this.userSettingId);
        this.bindTime();
    }

    public static bindTime(): void {
        const elementId = "statistics-time";
        const element = document.getElementById(elementId);

        if (!element) {
            console.error(`Could not find an element with the id - "${elementId}".`);
            return;
        }

        let time = <number>Iframe.getValueOfUserSettings(this.userSettingId, "totalSecondsSpent");

        if (time === undefined)
            console.warn("The time value is undefined.");

        // from seconds to hours.
        time /= 3600
        time = Math.floor(time);

        element.textContent = String(time);
    }
}


DOMLoaded.runFunction(() => Statistics.main());
