function SettingsDownload() {}


SettingsDownload.userSettingId = 'settings_download';


SettingsDownload.buttons = [
    {
        id: 'save',
        events: [
            {
                type: 'click',
                event: function() {
                    SettingsDownload.buttonClick();
                }
            }
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

                    SettingsDownload.sliderChange(id, value);
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


SettingsDownload.main = async function() {
    await SettingsIframe.initUserSettings();
    SettingsIframe.bindButtons(SettingsDownload.buttons);
    SettingsIframe.bindSliders(SettingsDownload.sliders, SettingsDownload.userSettingId);
    SettingsIframe.bindForms(SettingsDownload.forms, SettingsDownload.userSettingId);
}


SettingsDownload.buttonClick = function() {
    SettingsIframe.saveUserSettings(SettingsDownload.forms, SettingsDownload.userSettingId);
}


SettingsDownload.sliderChange = function(id, value) {
    document.getElementById(id).textContent = value;
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsDownload.main);
} else {
    SettingsDownload.main();
}
