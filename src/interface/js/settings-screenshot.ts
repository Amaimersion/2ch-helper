import {DOMLoaded} from "@modules/dom";
import {UserSettings} from "@modules/storage-sync";
import {Forms, Iframe} from "./settings-iframe";


abstract class PageInfo {
    protected static settingKey = "settingsScreenshot";

    protected static formElement: Forms.Element = {
        id: "form"
    };

    protected static inputForms: Forms.Input[] = [
        // Posts.
        {
            formId: "posts-name",
            settingField: "posts",
            settingKey: "name"
        },
        {
            formId: "posts-format",
            settingField: "posts",
            settingKey: "format"
        },
        {
            formId: "posts-quality",
            settingField: "posts",
            settingKey: "quality"
        },
        {
            formId: "posts-fillColor",
            settingField: "posts",
            settingKey: "fillColor"
        },
        {
            formId: "posts-turnOffPosts",
            settingField: "posts",
            settingKey: "turnOffPosts"
        },
        {
            formId: "posts-paddingTop",
            settingField: "posts",
            settingKey: "paddingTop"
        },
        {
            formId: "posts-paddingBottom",
            settingField: "posts",
            settingKey: "paddingBottom"
        },
        {
            formId: "posts-paddingLeft",
            settingField: "posts",
            settingKey: "paddingLeft"
        },
        {
            formId: "posts-paddingRight",
            settingField: "posts",
            settingKey: "paddingRight"
        },
        {
            formId: "posts-paddingBetween",
            settingField: "posts",
            settingKey: "paddingBetween"
        },
        // Thread.
        {
            formId: "thread-name",
            settingField: "thread",
            settingKey: "name"
        },
        {
            formId: "thread-format",
            settingField: "thread",
            settingKey: "format"
        },
        {
            formId: "thread-quality",
            settingField: "thread",
            settingKey: "quality"
        },
        {
            formId: "thread-fillColor",
            settingField: "thread",
            settingKey: "fillColor"
        },
        {
            formId: "thread-paddingTop",
            settingField: "thread",
            settingKey: "paddingTop"
        },
        {
            formId: "thread-paddingBottom",
            settingField: "thread",
            settingKey: "paddingBottom"
        },
        {
            formId: "thread-paddingLeft",
            settingField: "thread",
            settingKey: "paddingLeft"
        },
        {
            formId: "thread-paddingRight",
            settingField: "thread",
            settingKey: "paddingRight"
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


DOMLoaded.runFunction(() => SettingsScreenshot.main());
