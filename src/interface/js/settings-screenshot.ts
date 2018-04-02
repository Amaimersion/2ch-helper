import SettingsIframe from "./settings-iframe";


export default class SettingsScreenshot {
    static userSettingId: string;
    static buttons: Array<{id: string, events: Array<{type: string, event: () => void}>}>;
    static forms: Array<{type: string, data: Array<{elementId: string, settingId: string}>}>;
    static sliders: Array<{id: string, settingId: string, options: Object, events: Array<{name: string, event: (sliderValue: any) => void}>}>;
    static main: () => Promise<void>;
    static buttonClickEvent: () => void;
    static sliderChangeEvent: (id: string, value: string) => void;
    static customBind: () => void;
}


interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}


SettingsScreenshot.userSettingId = 'settings_screenshot';


SettingsScreenshot.buttons = [
    {
        id: 'save',
        events: [
            {
                type: 'click',
                event: function() {
                    SettingsScreenshot.buttonClickEvent();
                }
            }
        ]
    }
];


SettingsScreenshot.forms = [
    {
        type: 'input',
        data: [
            {elementId: 'nameForPosts', settingId: 'fileNamePosts'},
            {elementId: 'nameForThread', settingId: 'fileNameThread'}
        ]
    },
    {
        type: 'select',
        data: [
            {elementId: 'screenshotFormat', settingId: 'format'}
        ]
    },
    {
        type: 'span',
        data: [
            {elementId: 'screenshotQualityValue', settingId: 'quality'},
            {elementId: 'screenshotDelayValue', settingId: 'delay'}
        ]
    },
    {
        type: 'checkbox',
        data: [
            {elementId: 'turnOffTrue', settingId: 'turnOffPostsYes'},
            {elementId: 'turnOffFalse', settingId: 'turnOffPostsNo'}
        ]
    }
];


SettingsScreenshot.sliders = [
    {
        id: '#screenshotQuality',
        settingId: 'quality',
        options: {
            tooltip: 'hide'
        },
        events: [
            {
                name: 'change',
                event: function(sliderValue) {
                    const id = 'screenshotQualityValue';
                    const value = sliderValue.newValue;

                    SettingsScreenshot.sliderChangeEvent(id, value);
                }
            }
        ]
    },
    {
        id: '#screenshotDelay',
        settingId: 'delay',
        options: {
            tooltip: 'hide'
        },
        events: [
            {
                name: 'change',
                event: function(sliderValue) {
                    const id = 'screenshotDelayValue';
                    const value = sliderValue.newValue;

                    SettingsScreenshot.sliderChangeEvent(id, value);
                }
            }
        ]
    }
];


SettingsScreenshot.main = async function() {
    await SettingsIframe.initUserSettings();
    SettingsIframe.bindButtons(SettingsScreenshot.buttons);
    SettingsIframe.bindSliders(SettingsScreenshot.sliders, SettingsScreenshot.userSettingId);
    SettingsIframe.bindForms(SettingsScreenshot.forms, SettingsScreenshot.userSettingId);
    SettingsScreenshot.customBind();
}


SettingsScreenshot.buttonClickEvent = function() {
    SettingsIframe.saveUserSettings(
        SettingsScreenshot.forms, SettingsScreenshot.userSettingId
    );
    SettingsIframe.sendMessageToContent(
        {type: 'command', command: 'updateUserSettings'}
    );
    SettingsIframe.sendMessageToBackground(
        {type: 'command', command: 'updateUserSettings'}
    );
}


SettingsScreenshot.sliderChangeEvent = function(id, value) {
    document.getElementById(id).textContent = value;
}


SettingsScreenshot.customBind = function() {
    const qualityElement = document.getElementById('quality');
    const selectElement = <HTMLSelectElement>document.getElementById('screenshotFormat');

    if (selectElement.value === 'png') {
        qualityElement.style.display = 'none';
    }

    selectElement.addEventListener('change', (event: HTMLInputEvent) => {
        if (event.target.value === 'jpeg') {
            qualityElement.style.display = 'block';
        } else if (event.target.value === 'png') {
            qualityElement.style.display = 'none';
        }
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsScreenshot.main);
} else {
    SettingsScreenshot.main();
}
