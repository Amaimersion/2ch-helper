/**
 * Script for settings-download.html.
 * 
 * @module SettingsDownload
 */
function SettingsDownload() {}


/** 
 * Which user setting field belongs to this script.
 * 
 * @memberof SettingsDownload
 * @static
 * @type {String}
 */
SettingsDownload.userSettingId = 'settings_download';


/** 
 * Data about buttons on the page.
 * 
 * @memberof SettingsDownload
 * @static
 * @type {Array<Object>}
 */
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


/** 
 * Data about other form elements on the page.
 * 
 * @memberof SettingsDownload
 * @static
 * @type {Array<Object>}
 */
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


/** 
 * Data about sliders (bootstrap-slider.min.js) on the page.
 * 
 * @memberof SettingsDownload
 * @static
 * @type {Array<Object>}
 */
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


/**
 * Starts when the page has the status 'DOMContentLoaded'.
 * 
 * @memberof SettingsDownload
 * @static
 * @async
 */
SettingsDownload.main = async function() {
    await SettingsIframe.initUserSettings();
    SettingsIframe.bindButtons(SettingsDownload.buttons);
    SettingsIframe.bindSliders(SettingsDownload.sliders, SettingsDownload.userSettingId);
    SettingsIframe.bindForms(SettingsDownload.forms, SettingsDownload.userSettingId);
    SettingsDownload.customBind();
}


/**
 * Click event for a button.
 * 
 * @memberof SettingsDownload
 * @static
 */
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


/**
 * Change event for a slider (bootstrap-slider.min.js).
 * 
 * @memberof SettingsDownload
 * @static
 * 
 * @param {String} id
 * The id of value span for setting the value.
 * 
 * @param {String} value 
 * The value to set.
 */
SettingsDownload.sliderChangeEvent = function(id, value) {
    document.getElementById(id).textContent = value;
}


/**
 * Some custom binding that don't require another modules methods.
 * 
 * @memberof SettingsDownload
 * @static
 */
SettingsDownload.customBind = function() {
    const name = document.getElementById('downloadName');
    const auto = document.getElementById('downloadNameAuto');
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


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsDownload.main);
} else {
    SettingsDownload.main();
}
