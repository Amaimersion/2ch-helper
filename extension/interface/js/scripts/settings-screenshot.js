/**
 * Script for settings-screenshot.html.
 * 
 * @module SettingsScreenshot
 */
function SettingsScreenshot() {}


/** 
 * Which user setting field belongs to this script.
 * 
 * @memberof SettingsScreenshot
 * @static
 * @type {String}
 */
SettingsScreenshot.userSettingId = 'settings_screenshot';


/** 
 * Data about buttons on the page.
 * 
 * @memberof SettingsScreenshot
 * @static
 * @type {Array<Object>}
 */
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


/** 
 * Data about other form elements on the page.
 * 
 * @memberof SettingsScreenshot
 * @static
 * @type {Array<Object>}
 */
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


/** 
 * Data about sliders (bootstrap-slider.min.js) on the page.
 * 
 * @memberof SettingsScreenshot
 * @static
 * @type {Array<Object>}
 */
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


/**
 * Starts when the page has the status 'DOMContentLoaded'.
 * 
 * @memberof SettingsScreenshot
 * @static
 * @async
 */
SettingsScreenshot.main = async function() {
    await SettingsIframe.initUserSettings();
    SettingsIframe.bindButtons(SettingsScreenshot.buttons);
    SettingsIframe.bindSliders(SettingsScreenshot.sliders, SettingsScreenshot.userSettingId);
    SettingsIframe.bindForms(SettingsScreenshot.forms, SettingsScreenshot.userSettingId);
    SettingsScreenshot.customBind();
}


/**
 * Click event for a button.
 * 
 * @memberof SettingsScreenshot
 * @static
 */
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


/**
 * Change event for a slider (bootstrap-slider.min.js).
 * 
 * @memberof SettingsScreenshot
 * @static
 * 
 * @param {String} id
 * The id of value span for setting the value.
 * 
 * @param {String} value 
 * The value to set.
 */
SettingsScreenshot.sliderChangeEvent = function(id, value) {
    document.getElementById(id).textContent = value;
}


/**
 * Some custom binding that don't require another modules methods.
 * 
 * @memberof SettingsDownload
 * @static
 */
SettingsScreenshot.customBind = function() {
    const qualityElement = document.getElementById('quality');
    const selectElement = document.getElementById('screenshotFormat');
   
    if (selectElement.value === 'png') {
        qualityElement.style.display = 'none';
    }

    selectElement.addEventListener('change', (event) => {
        if (event.target.value === 'jpeg') {
            qualityElement.style.display = 'block';
        } else if (event.target.value === 'png') {
            qualityElement.style.display = 'none';
        }
    });
}


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsScreenshot.main);
} else {
    SettingsScreenshot.main();
}
