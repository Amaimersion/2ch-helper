import {DOMLoaded} from "@modules/DOM";
import {ElementsInfo, ElementsEvent, Iframe} from "./settings-iframe"; // double export of bootstrap-slider because of this?


abstract class PageInfo {
    public static nameInputId: string = "downloadName";
    public static autoInputId: string = "downloadNameAuto";
    public static userInputId: string = "downloadNameUser";

    public static buttons: ElementsInfo.ButtonInfo[] = [
        {
            id: "save",
            events: [
                {
                    type: "click",
                    event: function() {
                        ElementsEvent.SaveButton.defaultEvent(
                            PageInfo.forms, SettingsDownload.userSettingId
                        );
                    }
                }
            ]
        }
    ];

    public static forms: ElementsInfo.FormInfo[] = [
        {
            type: "input",
            data: [
                {elementId: "downloadName", settingId: "fileName"}
            ]
        },
        {
            type: "span",
            data: [
                {elementId: "downloadDelayValue", settingId: "delay"}
            ]
        },
        {
            type: "checkbox",
            data: [
                {elementId: "downloadNameAuto", settingId: "autoDetectionName"},
                {elementId: "downloadNameUser", settingId: "userName"}
            ]
        }
    ];

    public static sliders: ElementsInfo.SliderInfo[] = [
        {
            id: "#downloadDelay",
            settingId: "delay",
            options: {
                tooltip: "hide"
            },
            events: [
                {
                    name: "change",
                    event: function(sliderValue: any) {
                        const id = "downloadDelayValue";
                        const value = sliderValue.newValue;

                        ElementsEvent.Slider.changeEvent(id, value);
                    }
                }
            ]
        }
    ];
}


abstract class SettingsDownload {
    public static userSettingId: string = "settings_download";

    public static async main(): Promise<void> {
        await Iframe.initUserSettings(this.userSettingId);
        Iframe.bindButtons(PageInfo.buttons);
        Iframe.bindSliders(PageInfo.sliders, this.userSettingId);
        Iframe.bindForms(PageInfo.forms, this.userSettingId);
        this.customBind();
    }

    public static customBind(): void {
        const name = <HTMLInputElement>document.getElementById(PageInfo.nameInputId);
        const auto = <HTMLInputElement>document.getElementById(PageInfo.autoInputId);
        const user = <HTMLInputElement>document.getElementById(PageInfo.userInputId);

        if (!name) {
            console.error(`Could not find an input with the id - "${PageInfo.nameInputId}".`);
            return;
        }

        if (!auto) {
            console.error(`Could not find an input with the id - "${PageInfo.autoInputId}".`);
            return;
        }

        if (!user) {
            console.error(`Could not find an input with the id - "${PageInfo.userInputId}".`);
            return;
        }

        if (auto.checked) {
            name.style.display = "none";
        }

        auto.addEventListener("click", () => {
            name.style.display = "none";
        });

        user.addEventListener("click", () => {
            name.style.display = "block";
        });
    }
}


DOMLoaded.runFunction(() => SettingsDownload.main());
