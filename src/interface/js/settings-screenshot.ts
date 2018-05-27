import {DOMLoaded} from "@modules/dom";
import {ElementsInfo, ElementsEvent, Iframe} from "./settings-iframe";


abstract class PageInfo {
    public static qualityFormId: string = "quality";
    public static selectScreenshotFormatId: string = "screenshotFormat";

    public static buttons: ElementsInfo.ButtonInfo[] = [
        {
            id: "save",
            events: [
                {
                    type: "click",
                    event: function() {
                        ElementsEvent.SaveButton.defaultEvent(
                            PageInfo.forms, SettingsScreenshot.userSettingId
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
                {elementId: "nameForPosts", settingId: "fileNamePosts"},
                {elementId: "nameForThread", settingId: "fileNameThread"}
            ]
        },
        {
            type: "select",
            data: [
                {elementId: "screenshotFormat", settingId: "format"}
            ]
        },
        {
            type: "span",
            data: [
                {elementId: "screenshotQualityValue", settingId: "quality"},
                {elementId: "screenshotDelayValue", settingId: "delay"}
            ]
        },
        {
            type: "checkbox",
            data: [
                {elementId: "turnOffTrue", settingId: "turnOffPostsYes"},
                {elementId: "turnOffFalse", settingId: "turnOffPostsNo"}
            ]
        }
    ];

    public static sliders: ElementsInfo.SliderInfo[] = [
        {
            id: "#screenshotQuality",
            settingId: "quality",
            options: {
                tooltip: "hide"
            },
            events: [
                {
                    name: "change",
                    event: function(sliderValue: any) {
                        const id = "screenshotQualityValue";
                        const value = sliderValue.newValue;

                        ElementsEvent.Slider.changeEvent(id, value);
                    }
                }
            ]
        },
        {
            id: "#screenshotDelay",
            settingId: "delay",
            options: {
                tooltip: "hide"
            },
            events: [
                {
                    name: "change",
                    event: function(sliderValue: any) {
                        const id = "screenshotDelayValue";
                        const value = sliderValue.newValue;

                        ElementsEvent.Slider.changeEvent(id, value);
                    }
                }
            ]
        }
    ];
}


abstract class SettingsScreenshot {
    public static userSettingId = "settings_screenshot";

    public static async main(): Promise<void> {
        await Iframe.initUserSettings(this.userSettingId);
        Iframe.bindButtons(PageInfo.buttons);
        Iframe.bindSliders(PageInfo.sliders, this.userSettingId);
        Iframe.bindForms(PageInfo.forms, this.userSettingId);
        this.customBind();
    }

    public static customBind(): void {
        const qualityElement = <HTMLDivElement>document.getElementById(PageInfo.qualityFormId);
        const selectElement = <HTMLSelectElement>document.getElementById(PageInfo.selectScreenshotFormatId);

        if (!qualityElement) {
            console.error(`Could not find an element with the id - "${PageInfo.qualityFormId}".`);
            return;
        }

        if (!selectElement) {
            console.error(`Could not find a select element with the id - "${PageInfo.selectScreenshotFormatId}".`);
            return;
        }

        if (selectElement.value === "png") {
            qualityElement.style.display = "none";
        }

        selectElement.addEventListener("change", (event: ElementsInfo.HTMLInputEvent) => {
            if (event.target.value === "jpeg") {
                qualityElement.style.display = "block";
            } else if (event.target.value === "png") {
                qualityElement.style.display = "none";
            }
        });
    }
}


DOMLoaded.runFunction(() => SettingsScreenshot.main());
