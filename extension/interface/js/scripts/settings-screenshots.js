function SettingsScreenshot() {}


SettingsScreenshot.userSettingId = 'settings_screenshot';


SettingsScreenshot.userSettings = {};


SettingsScreenshot.buttons = [
    {
        id: 'save',
        events: [
            {
                type: 'click',
                event: function() {
                    SettingsScreenshot.saveUserSettings();
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
                event: function(value) {
                    document.getElementById('screenshotQualityValue').textContent = value.newValue;
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
                event: function(value) {
                    document.getElementById('screenshotDelayValue').textContent = value.newValue;
                }
            }
        ]
    }
];


SettingsScreenshot.forms = [
    {
        tag: 'input',
        data: [
            {elementId: 'nameForPosts', settingId: 'fileNamePosts'},
            {elementId: 'nameForThread', settingId: 'fileNameThread'}
        ]
    },
    {
        tag: 'select',
        data: [
            {elementId: 'screenshotFormat', settingId: 'format'}
        ]
    },
    {
        tag: 'span',
        data: [
            {elementId: 'screenshotQualityValue', settingId: 'quality'},
            {elementId: 'screenshotDelayValue', settingId: 'delay'}
        ]
    }
];


SettingsScreenshot.main = function() {
    SettingsScreenshot.bindButtons();

    const initPromise = SettingsScreenshot.initUserSettings();

    initPromise.then(() => {
        SettingsScreenshot.bindSliders();
        SettingsScreenshot.bindUserSettings();
    });
}


SettingsScreenshot.bindButtons = function() {
    for (let buttonData of this.buttons) {
        const element = document.getElementById(buttonData.id);

        for (let event of buttonData.events) {
            element.addEventListener(event.type, event.event);
        }
    }
}


SettingsScreenshot.bindSliders = function() {
    for (let sliderData of this.sliders) {
        const options = sliderData.options;
        options['value'] = this.userSettings[this.userSettingId][sliderData.settingId];

        const slider = new Slider(sliderData.id, options);

        for (let event of sliderData.events) {
            slider.on(event.name, event.event);
        }
    }
}


SettingsScreenshot.bindUserSettings = function() {
    for (let formData of this.forms) {
        for (let data of formData.data) {
            const element = document.getElementById(data.elementId);
            const value = this.userSettings[this.userSettingId][data.settingId];

            if (formData.tag === 'input' || formData.tag === 'select') {
                element.value = value;
            } else if (formData.tag === 'span') {
                element.textContent = value;
            }
        }
    }
}


SettingsScreenshot.initUserSettings = function() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(this.userSettingId, (data) => {
            this.userSettings = data;
            return resolve();
        });
    });
}


SettingsScreenshot.saveUserSettings = function() {
    this.updateUserData();
    chrome.storage.sync.set(this.userSettings);
}


SettingsScreenshot.updateUserData = function() {
    for (let formData of this.forms) {
        for (let data of formData.data) {
            const element = document.getElementById(data.elementId);
            let value = undefined;

            if (formData.tag === 'input' || formData.tag === 'select') {
                value = element.value;
            } else if (formData.tag === 'span') {
                value = Number(element.textContent);
            }

            this.userSettings[this.userSettingId][data.settingId] = value;
        }
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsScreenshot.main);
} else {
    SettingsScreenshot.main();
}
