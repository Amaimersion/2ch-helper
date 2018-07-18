import {DOMLoaded} from "@modules/dom";
import {UserSettings} from "@modules/storage-sync";
import {Forms, Iframe} from "./settings-iframe";


abstract class PageInfo {
    protected static settingKey = "settingsOther";

    protected static formElement: Forms.Element = {
        id: "form"
    };

    protected static inputForms: Forms.Input[] = [
        {
            formId: "other-notificationWhenReply",
            settingField: "other",
            settingKey: "notificationWhenReply"
        },
        {
            formId: "other-downloadButtonNearFile",
            settingField: "other",
            settingKey: "downloadButtonNearFile"
        },
        {
            formId: "other-exifButtonNearFile",
            settingField: "other",
            settingKey: "exifButtonNearFile"
        },
        {
            formId: "other-expandImageWhenTarget",
            settingField: "other",
            settingKey: "expandImageWhenTarget"
        },
        {
            formId: "other-addMissingTitles",
            settingField: "other",
            settingKey: "addMissingTitles"
        },
        {
            formId: "other-addMissingForms",
            settingField: "other",
            settingKey: "addMissingForms"
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
