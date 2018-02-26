/**
 * Script for iframe.
 * 
 * @module SettingsIframe
 */
function SettingsIframe() {}


/** 
 *  User settings.
 * 
 * @memberof SettingsIframe
 * @static
 * @type {Object}
 */
SettingsIframe.userSettings = {};


/** 
 *  What settings to receive.
 * 
 * @memberof SettingsIframe
 * @static
 * @type {Array<String>}
 */
SettingsIframe.userSettingIds = [
    'settings_screenshot',
    'settings_download'
];


/**
 * Gets and inits user settings.
 * Data for receiving settings are getting from SettingsIframe.userSettingIds.
 * 
 * @memberof SettingsIframe
 * @static
 * @async
 * 
 * @returns {Promise<void>}
 * A promise for the init that will resolve when receive and initialize are successfully completed.
 * Resolve will contain nothing if success. 
 */
SettingsIframe.initUserSettings = function() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(this.userSettingId, (data) => {
            this.userSettings = data;
            return resolve();
        });
    });
}


/**
 * Updates SettingsIframe.userSettings.
 * 
 * @memberof SettingsIframe
 * @static
 * 
 * @param {Array<Object>} forms
 * The forms for getting information about settings.
 * Expects: SettingsScreenshot.forms or SettingsDownload.forms.
 * 
 * @param {String} settingField
 * In what field of settings to save. 
 */
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


/**
 * Saves current SettingsIframe.userSettings to settings on the field.
 * 
 * @memberof SettingsIframe
 * @static
 * 
 * @param {Array<Object>} forms
 * The forms for getting information about settings.
 * Expects: SettingsScreenshot.forms or SettingsDownload.forms.
 * 
 * @param {String} settingField
 * In what field of settings to save. 
 */
SettingsIframe.saveUserSettings = function(forms, settingField) {
    // first, update the SettingsIframe.userSettings.
    this.updateUserData(forms, settingField);
    // then save it.
    chrome.storage.sync.set(this.userSettings);
}


/**
 * Binds buttons.
 * 
 * @memberof SettingsIframe
 * @static
 * 
 * @param {Array<Object>} buttons 
 * A buttons for binding.
 * Expects: SettingsScreenshot.buttons or SettingsDownload.buttons.
 */
SettingsIframe.bindButtons = function(buttons) {
    for (let buttonData of buttons) {
        const element = document.getElementById(buttonData.id);

        for (let event of buttonData.events) {
            element.addEventListener(event.type, event.event);
        }
    }
}


/**
 * Binds forms.
 * 
 * @memberof SettingsIframe
 * @static
 * 
 * @param {Array<Object>} forms 
 * A forms for binding.
 * Expects: SettingsScreenshot.forms or SettingsDownload.forms.
 * 
 * @param {String} settingField
 * From what field of settings to read parameters.
 */
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


/**
 * Binds sliders (bootstrap-slider.min.js).
 * 
 * @memberof SettingsIframe
 * @static
 * 
 * @param {Array<Object>} sliders 
 * A sliders for binding.
 * Expects: SettingsScreenshot.sliders or SettingsDownload.sliders.
 * 
 * @param {String} settingField
 * From what field of settings to read parameters.
 */
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
