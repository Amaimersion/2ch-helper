function SettingsScreenshot() {}


SettingsScreenshot.userSettingId = 'settings_screenshot';


SettingsScreenshot.buttons = [
    {
        id: 'save',
        events: [
            {
                type: 'click',
                event: function() {
                    SettingsScreenshot.buttonClick();
                }
            }
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

                    SettingsScreenshot.sliderChange(id, value);
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
                    
                    SettingsScreenshot.sliderChange(id, value);
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
    }
];


SettingsScreenshot.main = async function() {
    await SettingsIframe.initUserSettings();
    SettingsIframe.bindButtons(SettingsScreenshot.buttons);
    SettingsIframe.bindSliders(SettingsScreenshot.sliders, SettingsScreenshot.userSettingId);
    SettingsIframe.bindForms(SettingsScreenshot.forms, SettingsScreenshot.userSettingId);
}


SettingsScreenshot.buttonClick = function() {
    SettingsIframe.saveUserSettings(SettingsScreenshot.forms, SettingsScreenshot.userSettingId);
}


SettingsScreenshot.sliderChange = function(id, value) {
    document.getElementById(id).textContent = value;
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsScreenshot.main);
} else {
    SettingsScreenshot.main();
}
