import Slider from "@libs/slider";


export default class SettingsIframe {
    static userSettings: any;
    static userSettingIds: Array<string>;
    static initUserSettings: () => Promise<void>;
    static updateUserData: (forms: any, settingField: string) => void;
    static saveUserSettings: (forms: any, settingField: string) => void;
    static bindButtons: (buttons: Array<any>) => void;
    static bindForms: (forms: any, settingField: string) => void;
    static bindSliders: (sliders: Array<any>, settingsField: string) => void;
    static sendMessageToContent: (message: Object, callback?: (response: any) => void) => void;
    static sendMessageToBackground: (message: Object, callback?: (response: any) => void) => void;
}


SettingsIframe.userSettings = {};


SettingsIframe.userSettingIds = [
    'settings_screenshot',
    'settings_download',
    'statistics'
];


SettingsIframe.initUserSettings = function() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(this.userSettingId, (data) => {
            this.userSettings = data;
            return resolve();
        });
    });
}


SettingsIframe.updateUserData = function(forms, settingField) {
    for (let formData of forms) {
        for (let data of formData.data) {
            const element = <HTMLInputElement>document.getElementById(data.elementId);
            let value = undefined;

            if (formData.type === 'input' || formData.type === 'select') {
                value = element.value;
            } else if (formData.type === 'span') {
                value = Number(element.textContent);
            } else if (formData.type === 'checkbox') {
                value = element.checked;
            }

            this.userSettings[settingField][data.settingId] = value;
        }
    }
}


SettingsIframe.saveUserSettings = function(forms, settingField) {
    // first, update the SettingsIframe.userSettings.
    this.updateUserData(forms, settingField);
    // then save it.
    chrome.storage.sync.set(this.userSettings);
}


SettingsIframe.bindButtons = function(buttons) {
    for (let buttonData of buttons) {
        const element = document.getElementById(buttonData.id);

        for (let event of buttonData.events) {
            element.addEventListener(event.type, event.event);
        }
    }
}


SettingsIframe.bindForms = function(forms, settingField) {
    for (let formData of forms) {
        for (let data of formData.data) {
            const element = <HTMLInputElement>document.getElementById(data.elementId);
            const value = this.userSettings[settingField][data.settingId];

            if (formData.type === 'input' || formData.type === 'select') {
                element.value = value;
            } else if (formData.type === 'span') {
                element.textContent = value;
            } else if (formData.type === 'checkbox') {
                element.checked = value;
            }
        }
    }
}


SettingsIframe.bindSliders = function(sliders, settingField) {
    for (let sliderData of sliders) {
        const options = sliderData.options;
        options['value'] = this.userSettings[settingField][sliderData.settingId];
        const slider = new Slider(sliderData.id, options);

        for (let event of sliderData.events) {
            slider.on(event.name, event.event);
        }
    }
}


SettingsIframe.sendMessageToContent = function(message, callback) {
    callback = callback || function() {};

    chrome.tabs.query({url: '*://2ch.hk/*/res/*'}, (tabs) => {
        for (let tab of tabs) {
            chrome.tabs.sendMessage(tab.id, message, (response) => {
                callback(response);
            });
        }
    });
}


SettingsIframe.sendMessageToBackground = function(message, callback) {
    callback = callback || function() {};

    chrome.runtime.sendMessage(message, (response) => {
        callback(response);
    });
}
