function SettingsIframe() {}


SettingsIframe.userSettings = {};


SettingsIframe.userSettingIds = [
    'settings_screenshot',
    'settings_download'
];


SettingsIframe.initUserSettings = function() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(this.userSettingId, (data) => {
            this.userSettings = data;
            return resolve();
        });
    });
}


SettingsIframe.saveUserSettings = function(forms, settingField) {
    this.updateUserData(forms, settingField);
    chrome.storage.sync.set(this.userSettings);
}


SettingsIframe.updateUserData = function(forms, settingField) {
    for (let formData of forms) {
        for (let data of formData.data) {
            const element = document.getElementById(data.elementId);
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


SettingsIframe.bindButtons = function(buttons) {
    for (let buttonData of buttons) {
        const element = document.getElementById(buttonData.id);

        for (let event of buttonData.events) {
            element.addEventListener(event.type, event.event);
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


SettingsIframe.bindForms = function(forms, settingField) {
    for (let formData of forms) {
        for (let data of formData.data) {
            const element = document.getElementById(data.elementId);
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
