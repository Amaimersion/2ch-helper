/** 
 * The module that run a main function when 
 * a page has the status 'DOMContentLoaded'.
 * 
 * @module ContentDOMContentLoaded
 */
function ContentDOMContentLoaded() {}


/**
 * Runs when a page has the status 'DOMContentLoaded'.
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 */
ContentDOMContentLoaded.main = function() {
    this.bindCheckboxes();
}


/**
 * Binds events to checkboxes on a page.
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 * 
 * @param {String} [checkboxesSelector=input[type="checkbox"]] 
 * A query selector for finding checkboxes. 
 * Defaults to 'input[type="checkbox"]'.
 */
ContentDOMContentLoaded.bindCheckboxes = function(checkboxesSelector) {
    checkboxesSelector = checkboxesSelector || 'input[type="checkbox"]';
    const thread = ContentAPI.getThread();    
    const checkboxes = thread.querySelectorAll(checkboxesSelector);

    ContentPageElements.addEventsToCheckboxes(checkboxes);
}


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContentDOMContentLoaded.main);
} else {
    ContentDOMContentLoaded.main();
}
