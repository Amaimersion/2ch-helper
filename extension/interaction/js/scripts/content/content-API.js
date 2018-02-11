function ContentAPI() {}


ContentAPI.anotherAPI = {
    'screenshot': {
        injected: false,
        path: '/interaction/js/scripts/content/content-screenshot.js',
        methods: {
            'createScreenshotOfPosts': function() {
                ContentScreenshot.createScreenshotOfPosts();
            },

            'createScreenshotOfThread': function() {
                ContentScreenshot.createScreenshotOfThread();
            }
        }
    },

    'download': {
        injected: false,
        path: '/interaction/js/scripts/content/content-downloads.js',
        methods: {
            'downloadImages': function() {
                ContentDownloads.downloadImages();
            },

            'downloadVideo': function() {
                ContentDownloads.downloadVideo();
            },

            'downloadMedia': function() {
                ContentDownloads.downloadMedia();
            },
            
            'downloadThread': function() {
                ContentDownloads.downloadThread();
            }
        }
    }
};


ContentAPI.executeAnotherAPI = function(name, method) {
    return new Promise((resolve, reject) => {
        const injectPromise = this.injectAnotherAPI(name);

        injectPromise.then(() => {
            const executePromise = this.executeAnotherAPIMethod(
                name, 
                method
            );

            executePromise.then(() => {
                return resolve();
            }, (error) => {
                return reject(error);
            });
        }, (error) => {
            return reject(error);
        });
    });
}


ContentAPI.injectAnotherAPI = function(name) {
    return new Promise((resolve, reject) => {
        const status = this.anotherAPI[name].injected;

        if (status) {
            return resolve();
        } else {
            this.sendMessageToBackground({
                type: 'command',
                command: 'injectScript',
                path: this.anotherAPI[name].path
            }, (response) => {
                if (response.status) {
                    this.anotherAPI[name].injected = true;

                    return resolve();
                } else {
                    const error = new Error();
                    error.message = (
                        'Failed to inject ' + 
                        name + 
                        ' script.'
                    );

                    return reject(error);  
                }
            });
        }
    });
}


ContentAPI.executeAnotherAPIMethod = function(name, method) {
    return new Promise((resolve, reject) => {
        const anotherAPIMethod = this.anotherAPI[name].methods[method];

        if (typeof anotherAPIMethod === 'function') {
            anotherAPIMethod(); 
            return resolve();
        } else {
            const error = new Error();
            error.message = (
                'Failed to execute ' + 
                method + 
                ' method.'
            );

            return reject(error);
        }
    });
}


ContentAPI.getThread = function(id) {
    return document.getElementById(id || 'posts-form');
}


/**
* Gets a parent of the HTML element.
* 
* @param {HTMLElement} element 
* A beginning element.
* 
* @param {function(HTMLElement) => Boolean} condition
* A condition to complete.
* 
* @returns {HTMLElement}
* If condition was not declared, then document will be return.
* Otherwise element which satisfies condition will be return.
*/
ContentAPI.getParent = function(element, condition) {
   condition = condition || function(element) {return false;};
   let parent;

   do {
       parent = element;
       element = element.parentNode;
   } while (element && !condition(parent));

   return parent;
}


ContentAPI.sendMessageToBackground = function(message, callback) {
   callback = callback || function() {};

    chrome.runtime.sendMessage(message, (response) => {
        callback(response);
    });
}
