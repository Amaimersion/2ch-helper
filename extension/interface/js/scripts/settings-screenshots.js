function SettingsScreenshot() {}


SettingsScreenshot.sliders = [
    {
        id: '#screenshotQuality',
        options: {
            tooltip: 'hide'
        },
        events: [
            {
                name: 'slide',
                action: function(value) {
                    document.getElementById('screenshotQualityValue').textContent = value;
                }
            }
        ]
    },
    {
        id: '#screenshotDelay',
        options: {
            tooltip: 'hide'
        },
        events: [
            {
                name: 'slide',
                action: function(value) {
                    document.getElementById('screenshotDelayValue').textContent = value;
                }
            }
        ]
    }
];

SettingsScreenshot.forms = [
    {
        name: 'input',
        data: [
            {elementId: 'nameForPosts', settingId: 'fileNamePosts'},
            {elementId: 'nameForThread', settingId: 'fileNameThread'}
        ]
    },
    {
        name: 'select',
        data: [
            {elementId: 'screenshotFormat', settingId: 'format'}
        ]
    },
    {
        name: 'span',
        data: [
            {elementId: 'screenshotQualityValue', settingField: 'settings_screenshot', settingId: 'quality'},
            {elementId: 'screenshotDelayValue', settingField: 'settings_screenshot', settingId: 'delay'}
        ]
    }
];

SettingsScreenshot.buttons = [
    {
        id: 'save',
        events: [
            {
                name: 'click',
                action: function() {
                    SettingsScreenshot.saveUserData();
                }
            }
        ]
    }
];


SettingsScreenshot.main = function() {
    SettingsScreenshot.bindUserData();
    SettingsScreenshot.bindSliders();
    SettingsScreenshot.bindButtons();
}


SettingsScreenshot.saveUserData = function() {
    const data = this.createUserData();

    chrome.storage.sync.set(data);

}

SettingsScreenshot.createUserData = function() {
    const userData = {};

    userData['settings_screenshot'] = {
        fileNamePosts: document.getElementById('nameForPosts').value,
        fileNameThread: document.getElementById('nameForThread').value,
        format: document.getElementById('screenshotFormat').value,
        quality: Number(document.getElementById('screenshotQualityValue').textContent),
        delay: Number(document.getElementById('screenshotDelayValue').textContent)
    };

    return userData;
}

SettingsScreenshot.bindUserData = function() {
    const promise = this.getUserData();

    promise.then((settings) => {
        for (let formData of this.forms) {
            for (data of formData.data) {
                const element = document.getElementById(data.elementId);

                if (formData.name === 'input' || formData.name === 'select') {
                    element.value = settings['settings_screenshot'][data.settingId];
                } else if (formData.name === 'span') {
                    console.log('check');
                    element.textContent = settings['settings_screenshot'][data.settingId];
                }
            }
        }
    });
}

SettingsScreenshot.getUserData = function() {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("settings_screenshot", (data) => {
            resolve(data);
        });
    });
}

SettingsScreenshot.bindSliders = function() {
    for (let sliderData of this.sliders) {
        const slider = new Slider(sliderData.id,  sliderData.options);

        for (let event of sliderData.events) {
            slider.on(event.name, event.action);
        }
    }
}

SettingsScreenshot.bindButtons = function() {
    for (let buttonData of this.buttons) {
        const element = document.getElementById(buttonData.id);

        for (let event of buttonData.events) {
            element.addEventListener(event.name, event.action);
        }
    }
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SettingsScreenshot.main);
} else {
    SettingsScreenshot.main();
}
