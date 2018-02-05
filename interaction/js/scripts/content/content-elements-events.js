/**
 * @file Binds an events to the elements on a page.
 */


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}


/**
 * Starts when a page has the status 'DOMContentLoaded'.
 */
function main() {
    var thread = document.getElementById('posts-form');
    
    var checkboxes = thread.querySelectorAll('input');
    addEventListenersToCheckboxes(checkboxes);
}


/**
 * Binds an events to the checkboxes.
 * 
 * @param {NodeList<HTMLInputElement>} checkboxes
 * A checkboxes for binding.
 */
function addEventListenersToCheckboxes(checkboxes) {
    var i = checkboxes.length;

    while (i--) {
        checkboxes[i].addEventListener('change', function(event) {
            if (this.checked) {
                eventForCheckedCheckbox(this);
            } else {
                eventForUncheckedCheckbox(this);
            }
        });
    }
}


/**
 * Receives a post of the checkbox and
 * adds this post to the active posts.
 * 
 * @param {HTMLInputElement} checkbox 
 */
function eventForCheckedCheckbox(checkbox) {
    var post = getPostOfCheckbox(checkbox);
    GLOBAL_CONTENT_ACTIVE_POSTS.push(post);
}


/**
 * Receives a post of the checkbox and
 * removes this post from the active posts.
 * 
 * @param {HTMLInputElement} checkbox 
 */
function eventForUncheckedCheckbox(checkbox) {
    var post = getPostOfCheckbox(checkbox);
    var index = GLOBAL_CONTENT_ACTIVE_POSTS.indexOf(post);

    if (index != -1) {
        GLOBAL_CONTENT_ACTIVE_POSTS.splice(index, 1);
    }
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
function getParent(element, condition) {
    condition = condition || function(element) {return false;};
    var parent;

    do {
        parent = element;
        element = element.parentNode;
    } while (element && !condition(parent));

    return parent;
}


/**
 * Gets a post of the checkbox.
 * 
 * @param {HTMLInputElement} checkbox
 * 
 * @returns {HTMLElement} - A post (DIV).
 */
function getPostOfCheckbox(checkbox) {
    return getParent(checkbox, function(element) {
        var className = element.className;
        return (
            (className === 'post-wrapper') || 
            (className === 'oppost-wrapper')
        );
    });
}
