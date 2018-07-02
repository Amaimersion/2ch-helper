import {DOMLoaded} from "@modules/dom";
import {UserSettings} from "@modules/storage-sync";
import {API} from "@modules/api";


abstract class Statistics {
    private static _settings: UserSettings = undefined;

    public static async main(): Promise<void> {
        if (!this._settings) {
            this._settings = await API.getSettings("statistics");
        }

        this.bindTime();
    }

    protected static bindTime(): void {
        const element = API.getElement<HTMLElement>({
            selector: "#statistics-time"
        });

        let value: any = undefined;

        if (typeof this._settings.totalSpent === "number") {
            value = this._settings.totalSpent;

            console.log(value);

            // from milliseconds to hours.
            value = value / 1000 / 3600;
            value = Math.floor(value);
        } else {
            value = "Ошибка";
            console.error("The time is not a number type.");
        }

        element.textContent = value;
    }
}


DOMLoaded.run(() => {Statistics.main()});

/*
import {DOMLoaded} from "@modules/dom";
import {UserSettings} from "@modules/user-settings";


abstract class Statistics {
    public static userSettingId = "statistics";

    public static async main(): Promise<void> {
        await UserSettings.initUserSettings(this.userSettingId);
        this.bindTime();
    }

    public static bindTime(): void {
        const elementId = "statistics-time";
        const element = document.getElementById(elementId);

        if (!element) {
            console.error(`Could not find an element with the id - "${elementId}".`);
            return;
        }

        let time = <number>UserSettings.getValueOfUserSetting(this.userSettingId, "totalSecondsSpent");

        if (time === undefined)
            console.warn("The time value is undefined.");

        // from seconds to hours.
        time /= 3600
        time = Math.floor(time);

        element.textContent = String(time);
    }
}


DOMLoaded.runFunction(() => Statistics.main());
*/
