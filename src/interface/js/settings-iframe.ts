import {UserSettings, StorageSync} from "@modules/storage-sync";
import {Script} from "@modules/communication";


export namespace Forms {
    export interface Form {
        formId: string;
        settingField: string;
        settingKey: string;
    }

    export interface Input extends Form {}
    export interface Checkbox extends Form {}

    export interface Button {
        formId: string;
        eventType: string;
        eventMethod: (...args: any[]) => any;
    }

    export interface Element {
        id: string;
    }
}


export namespace Iframe {
    export function getElementById(id: string, checkDataset: boolean = true): HTMLElement {
        const element = document.getElementById(id);

        if (!element) {
            throw new Error(`Could not find an element with that id - "${id}".`);
        }

        if (
            checkDataset && (
            (!element.dataset || !Object.keys(element.dataset).length) ||
            (!element.dataset.type)
            )
        ) {
            throw new Error(`Could not use an element ("#${id}") without dataset.`);
        }

        return element;
    }

    export abstract class Settings {
        public static async getUserSettings(key: string): Promise<UserSettings> {
            const userSettings = await StorageSync.get(key);

            if (!userSettings || !Object.keys(userSettings).length) {
                throw new Error(`User settings with the key "${key}" is empty or undefined.`);
            }

            return userSettings[key];
        }

        public static bindForms(forms: Forms.Form[], userSettings: UserSettings): void {
            for (let form of forms) {
                let element = undefined;

                try {
                    element = <HTMLInputElement>Iframe.getElementById(form.formId);
                } catch (error) {
                    console.error(error);
                    continue;
                }

                const value = userSettings[form.settingField][form.settingKey];

                // !value shouldn't used here, because values can be either 0, or false, or "" and so on.
                if (typeof value === "undefined") {
                    console.error(
                        `Could not get a value with that field - "${form.settingField}" and that key - "${form.settingKey}".`
                    );
                    continue;
                }

                if (element.dataset.type === "boolean") {
                    element.checked = Boolean(value);
                } else {
                    element.value = value;
                }
            }
        }

        public static bindButtons(forms: Forms.Button[]): void {
            for (let form of forms) {
                let element = undefined;

                try {
                    element = <HTMLInputElement>Iframe.getElementById(form.formId, false);
                } catch (error) {
                    console.error(error);
                    continue;
                }

                element.addEventListener(form.eventType, form.eventMethod);
            }
        }

        public static bindForm(form: Forms.Element, method: (...args: any[]) => any): void {
            const element = <HTMLFormElement>Iframe.getElementById(form.id, false);
            element.onsubmit = method;
        }

        public static saveUserSettings(settingKey: string, settings: UserSettings): Promise<void> {
            return StorageSync.set({[settingKey]: settings});
        }
    }

    export abstract class Buttons {
        public static async resetButtonEvent(): Promise<void> {
            await StorageSync.restoreDefault(true);
            this.sendCommandToUpdateSettings();
            window.location.reload();
        }

        public static clearButtonEvent(forms: Forms.Form[]): void {
            for (let form of forms) {
                let element: HTMLInputElement = undefined;

                try {
                    element = <HTMLInputElement>Iframe.getElementById(form.formId);
                } catch (error) {
                    console.error(error);
                    continue;
                }

                if (element.dataset.type === "boolean") {
                    element.checked = false;
                } else {
                    element.value = "";
                }
            }
        }

        public static saveButtonEvent(forms: Forms.Form[], userSettings: UserSettings): UserSettings {
            for (let form of forms) {
                let element = undefined;

                try {
                    element = <HTMLInputElement>Iframe.getElementById(form.formId);
                } catch (error) {
                    console.error(error);
                    continue;
                }

                let type = element.dataset.type;
                let value: any = element.value;

                switch (type) {
                    case "number":
                        value = Number(value);
                        break;

                    case "string":
                        value = String(value);
                        break;

                    case "boolean":
                        value = element.checked;
                        break;

                    case "stringArray":
                        value = value.split(",");
                        value = value.map(String);
                        break;

                    default:
                        console.error(
                            `Unknown "data-type" ("${type}") for an element ("#${form.formId}").`
                        );
                        continue;
                }

                userSettings[form.settingField][form.settingKey] = value;
            }

            this.sendCommandToUpdateSettings();

            return userSettings;
        }

        protected static sendCommandToUpdateSettings(): void {
            Script.Background.sendMessageToAllContent(
                {type: "command", command: "updateSettings"},
                {url: "*://2ch.hk/*/res/*"}
            );
            Script.Content.sendMessageToBackground(
                {type: "command", command: "updateSettings"}
            );
        }
    }
}
