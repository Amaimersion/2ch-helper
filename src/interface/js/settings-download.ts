import SettingsIframe from "./settings-iframe"; // double export of bootstrap-slider because of this.


export default class SettingsDownload {
    static userSettingId: string;
    static buttons: Array<{id: string, events: Array<{type: string, event: () => void}>}>;
    static forms: Array<{type: string, data: Array<{elementId: string, settingId: string}>}>;
    static sliders: Array<{id: string, settingId: string, options: Object, events: Array<{name: string, event: (sliderValue: any) => void}>}>;
    static main: () => Promise<void>;
    static buttonClickEvent: () => void;
    static sliderChangeEvent: (id: string, value: string) => void;
    static customBind: () => void;
}


SettingsDownload.userSettingId = 'settings_download';


SettingsDownload.buttons = [
    {
        id: 'save',
        events: [
            {
                type: 'click',
                event: function() {
                    SettingsDownload.buttonClickEvent();
                }
            }
        ]
    }
];



SettingsDownload.forms = [
    {
        type: 'input',
        data: [
            {elementId: 'downloadName', settingId: 'fileName'}
        ]
    },
    {
        type: 'span',
        data: [
            {elementId: 'downloadDelayValue', settingId: 'delay'}
        ]
    },
    {
        type: 'checkbox',
        data: [
            {elementId: 'downloadNameAuto', settingId: 'autoDetectionName'},
            {elementId: 'downloadNameUser', settingId: 'userName'}
        ]
    }
];



SettingsDownload.sliders = [
    {
        id: '#downloadDelay',
        settingId: 'delay',
        options: {
            tooltip: 'hide'
        },
        events: [
            {
                name: 'change',
                event: function(sliderValue) {
                    const id = 'downloadDelayValue';
                    const value = sliderValue.newValue;

                    SettingsDownload.sliderChangeEvent(id, value);
                }
            }
        ]
    }
];



SettingsDownload.main = async function() {
    await SettingsIframe.initUserSettings();
    SettingsIframe.bindButtons(SettingsDownload.buttons);
    SettingsIframe.bindSliders(SettingsDownload.sliders, SettingsDownload.userSettingId);
    SettingsIframe.bindForms(SettingsDownload.forms, SettingsDownload.userSettingId);
    SettingsDownload.customBind();
}



SettingsDownload.buttonClickEvent = function() {
    SettingsIframe.saveUserSettings(
        SettingsDownload.forms, SettingsDownload.userSettingId
    );
    SettingsIframe.sendMessageToContent(
        {type: 'command', command: 'updateUserSettings'}
    );
    SettingsIframe.sendMessageToBackground(
        {type: 'command', command: 'updateUserSettings'}
    );
}


SettingsDownload.sliderChangeEvent = function(id, value) {
    document.getElementById(id).textContent = value;
}


SettingsDownload.customBind = function() {
    const name = document.getElementById('downloadName');
    const auto = <HTMLInputElement>document.getElementById('downloadNameAuto');
    const user = document.getElementById('downloadNameUser');

    if (auto.checked) {
        name.style.display = 'none';
    }

    auto.addEventListener('click', () => {
        name.style.display = 'none';
    });

    user.addEventListener('click', () => {
        name.style.display = 'block';
    });
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsDownload.main);
} else {
    SettingsDownload.main();
}
