import {DOMLoaded} from "@modules/dom";
import {UserSettings} from "@modules/storage-sync";
import {Forms, Iframe} from "./settings-iframe";


abstract class PageInfo {
    protected static settingKey = "settingsDownload";

    protected static formElement: Forms.Element = {
        id: "form"
    };

    protected static inputForms: Forms.Input[] = [
        // Images.
        {
            formId: "images-fileName",
            settingField: "images",
            settingKey: "fileName"
        },
        {
            formId: "images-autoFileName",
            settingField: "images",
            settingKey: "autoFileName"
        },
        {
            formId: "images-delay",
            settingField: "images",
            settingKey: "delay"
        },
        {
            formId: "images-types",
            settingField: "images",
            settingKey: "types"
        },
        // Video.
        {
            formId: "video-fileName",
            settingField: "video",
            settingKey: "fileName"
        },
        {
            formId: "video-autoFileName",
            settingField: "video",
            settingKey: "autoFileName"
        },
        {
            formId: "video-delay",
            settingField: "video",
            settingKey: "delay"
        },
        {
            formId: "video-types",
            settingField: "video",
            settingKey: "types"
        },
        // Thread.
        {
            formId: "thread-fileName",
            settingField: "thread",
            settingKey: "fileName"
        },
        {
            formId: "thread-autoFileName",
            settingField: "thread",
            settingKey: "autoFileName"
        }
    ];

    protected static buttonForms: Forms.Button[] = [
        {
            formId: "reset",
            eventType: "click",
            eventMethod: () => {
                Iframe.Buttons.resetButtonEvent();
            }
        },
        {
            formId: "clear",
            eventType: "click",
            eventMethod: () => {
                Iframe.Buttons.clearButtonEvent(PageInfo.inputForms);
            }
        }
    ];
}

abstract class SettingsScreenshot extends PageInfo {
    protected static _userSettings: UserSettings = undefined;

    public static async main(): Promise<void> {
        this._userSettings = await Iframe.Settings.getUserSettings(this.settingKey);
        this.bindForms();
    }

    protected static bindForms(): void {
        Iframe.Settings.bindForms(this.inputForms, this._userSettings);
        Iframe.Settings.bindButtons(this.buttonForms);
        Iframe.Settings.bindForm(this.formElement, () => {
            this._userSettings = Iframe.Buttons.saveButtonEvent(this.inputForms, this._userSettings);
            Iframe.Settings.saveUserSettings(this.settingKey, this._userSettings);
        });
    }
}


DOMLoaded.run(() => SettingsScreenshot.main());
