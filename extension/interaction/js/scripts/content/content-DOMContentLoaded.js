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
    this.bindObserver();
    ContentAPI.getUserSettings();
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
 * Binds an observer on the thread.
 * Observes for a new posts and reply posts.
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 */
ContentDOMContentLoaded.bindObserver = function() {
    const thread = ContentAPI.getThread();
    const config = {subtree: true, childList: true};
    const observer = new MutationObserver(this.observerEvent);

    observer.observe(thread, config);
}


/**
 * Calls after each DOM mutation.
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 * 
 * @param {Array<MutationRecord>} mutationList 
 * An array of mutations.
 */
ContentDOMContentLoaded.observerEvent = function(mutationList) {
    for (let mutation of mutationList) {
        for (let node of mutation.addedNodes) {
            if (ContentDOMContentLoaded.observerNodeCondition(node)) {
                if (node.classList.contains('reply')) {
                    ContentDOMContentLoaded.observerReplyNodeEvent(node);
                }
                
                ContentDOMContentLoaded.observerNodeEvent(node);
            }
        }
    }
}


/**
 * Checks if the node belongs to a post.
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 * 
 * @param {Node} node
 * A node for checking.
 *  
 * @returns {Boolean}
 */
ContentDOMContentLoaded.observerNodeCondition = function(node) {
    const nodesTags = ['DIV'];
    const nodesClasses = ['post-wrapper', 'reply'];

    if (!nodesTags.includes(node.tagName)) {
        return false;
    }

    const containClass = nodesClasses.some((element) => {
        return node.classList.contains(element);
    });

    if (!containClass) {
        return false;
    }

    return true;
}


/**
 * Event for any node.
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 * 
 * @param {Node} node A node for processing. 
 */
ContentDOMContentLoaded.observerNodeEvent = function(node) {
    const checkbox = node.querySelector('input[type="checkbox"]');
    ContentPageElements.bindCheckbox(checkbox);
}


/**
 * Event for reply node (reply post).
 * 
 * @memberof ContentDOMContentLoaded
 * @static
 * 
 * @param {Node} node A node for processing. 
 */
ContentDOMContentLoaded.observerReplyNodeEvent = function(node) {
    const originalId = node.id.replace('preview-', 'post-');
    const original = document.getElementById(originalId);

    const postCheckbox = original.querySelector('input[type="checkbox"]');
    const replyCheckbox = node.querySelector('input[type="checkbox"]');

    if (ContentPageElements.activePosts.includes(original)) {
        replyCheckbox.setAttribute('checked', 'checked');
    }

    replyCheckbox.onclick = function() {
        postCheckbox.click();
    }
}


/** 
 * Adds event listener to the page. 
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContentDOMContentLoaded.main);
} else {
    ContentDOMContentLoaded.main();
}
