/** 
 * The common module for usage in others content modules.
 * 
 * @module ContentAPI
 */
function ContentAPI() {}


/**
 * Information about other content modules.
 * 
 * @memberof ContentAPI
 * @static
 */
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


/**
 * Injects another module and executes the method of that module.
 * 
 * @memberof ContentAPI
 * @static
 * @async
 * @param {String} name A name of another content module.
 * @param {String} method A method of another content module.
 * @returns {Promise<undefined>} 
 * A promise for the execute that will resolve when injects and executes are successfully completed.
 * Resolve will contain undefined if success, otherwise reject will contain an error.
 */
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


/**
 * Injects another module into the page.
 * 
 * @memberof ContentAPI
 * @static
 * @async
 * @param {String} name A name of another content module.
 * @returns {Promise<undefined>}
 * A promise for the injection that will resolve when the module will injects.
 * Resolve will contain undefined if success, otherwise reject will contain an error. 
 */
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


/**
 * Executes a method of another module.
 * 
 * @memberof ContentAPI
 * @static
 * @async
 * @param {String} name A name of another content module.
 * @param {String} method A method of another content module.
 * @returns {Promise<undefined>} 
 * A promise for the execute that will resolve when the method will starts.
 * Resolve will contain undefined if success, otherwise reject will contain an error.
 */
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


/**
 * Gets a thread. Search occurs by id of a thread.
 * 
 * @memberof ContentAPI
 * @static
 * @param {String} [id=posts-form] An id of thread. Defaults to 'posts-form'.
 * @returns {HTMLElement} A thread if it was finded, otherwise null.
 */
ContentAPI.getThread = function(id) {
    return document.getElementById(id || 'posts-form');
}


/**
* Gets a parent of the HTML element.
* 
* @memberof ContentAPI
* @static

* @param {HTMLElement} element 
* A beginning element.
* 
* @param {function(HTMLElement) => Boolean} [condition]
* A condition to complete. Defaults does not affect the search.
* 
* @returns {HTMLElement}
* If the condition was not declared, then document will be return.
* Otherwise an element which satisfies the condition will be return.
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


/**
 * Sends a message to the background scripts.
 * 
 * @memberof ContentAPI
 * @static
 * @param {Object} message A message for sending.
 * @param {function(Object)} [callback] A callback that handle the response.
 */
ContentAPI.sendMessageToBackground = function(message, callback) {
   callback = callback || function() {};

    chrome.runtime.sendMessage(message, (response) => {
        callback(response);
    });
}
