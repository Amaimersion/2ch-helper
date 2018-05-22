import {ContentScript, BackgroundScript} from "@modules/Communication";
import * as Slider from "bootstrap-slider";


export namespace ElementsInfo {
    export interface ButtonInfo {
        id: string;
        events: ButtonEvent[];
    }

    export interface ButtonEvent {
        type: string;
        event: (...args: any[]) => any;
    }

    export interface FormInfo {
        type: string;
        data: FormData[];
    }

    export interface FormData {
        elementId: string;
        settingId: string;
    }

    export interface SliderInfo {
        id: string;
        settingId: string;
        options: Object;
        events: SliderEvent[];
    }

    export interface SliderEvent {
        name: string;
        event: (...args: any[]) => any;
    }

    export interface HTMLInputEvent extends Event {
        target: HTMLInputElement & EventTarget;
    }
}


export namespace ElementsEvent {
    export abstract class Slider {
        public static changeEvent(id: string, value: any): void {
            const slider = document.getElementById(id);

            if (!slider) {
                console.error(`Could not find an element with the id - "${id}".`);
                return;
            }

            slider.textContent = value;
        }
    }

    export abstract class SaveButton {
        public static defaultEvent(forms: ElementsInfo.FormInfo[], userSettingId: string): void {
            Iframe.saveUserSettings(
                forms, userSettingId
            );
            BackgroundScript.sendMessageToAllContentScripts(
                {type: "command", command: "updateUserSettings"},
                {url: "*://2ch.hk/*/res/*"}
            );
            ContentScript.sendMessageToBackgroundScript(
                {type: "command", command: "updateUserSettings"}
            );
        }
    }
}


interface UserSettings {
    [key: string]: any;
}


export abstract class Iframe {
    private static userSettings: UserSettings = {};

    public static async initUserSettings(key: string | Object | string[]): Promise<void> {
        const userData = await this.getUserSettings(key);

        if (!userData)
            console.warn(`User data for the key "${key}" is empty.`);

        this.userSettings = {...this.userSettings, ...userData};
    }

    public static getUserSettings(key: string | Object | string[]): Promise<UserSettings> {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (data) => {
                return resolve(data);
            });
        });
    }

    public static bindButtons(buttons: ElementsInfo.ButtonInfo[]): void {
        for (let buttonData of buttons) {
            const elementId = buttonData.id;
            const element = <HTMLButtonElement>document.getElementById(elementId);

            if (!element) {
                console.error(`Could not find an element with the id - "${elementId}".`);
                continue;
            }

            for (let event of buttonData.events) {
                element.addEventListener(event.type, event.event);
            }
        }
    }

    public static bindSliders(sliders: ElementsInfo.SliderInfo[], settingField: string): void {
        for (let sliderData of sliders) {
            const settingId = sliderData.settingId;
            const elementId = sliderData.id;
            const options = sliderData.options;

            options["value"] = this.userSettings[settingField][settingId] || 0;
            const slider = new Slider(elementId, options);

            for (let event of sliderData.events) {
                slider.on(event.name, event.event);
            }
        }
    }

    public static bindForms(forms: ElementsInfo.FormInfo[], settingField: string): void {
        for (let formData of forms) {
            for (let data of formData.data) {
                const element = <HTMLInputElement>document.getElementById(data.elementId);
                const value = this.userSettings[settingField][data.settingId];

                if (!element) {
                    console.error(`Could not find an element with the id - "${data.elementId}".`);
                    continue;
                }

                if (formData.type === "input" || formData.type === "select") {
                    element.value = value;
                } else if (formData.type === "span") {
                    element.textContent = value;
                } else if (formData.type === "checkbox") {
                    element.checked = value;
                }
            }
        }
    }

    public static updateUserData(forms: ElementsInfo.FormInfo[], settingField: string): void {
        for (let formData of forms) {
            for (let data of formData.data) {
                const element = <HTMLInputElement>document.getElementById(data.elementId);
                let value = undefined;

                if (!element) {
                    console.error(`Could not find an element with the id - "${data.elementId}".`);
                    continue;
                }

                if (formData.type === "input" || formData.type === "select") {
                    value = element.value;
                } else if (formData.type === "span") {
                    value = Number(element.textContent);
                } else if (formData.type === "checkbox") {
                    value = element.checked;
                }

                this.userSettings[settingField][data.settingId] = value;
            }
        }
    }

    public static saveUserSettings(forms: ElementsInfo.FormInfo[], settingField: string): void {
        // first, update the Iframe.userSettings,
        this.updateUserData(forms, settingField);
        // then save it.
        chrome.storage.sync.set(this.userSettings);
    }
}
