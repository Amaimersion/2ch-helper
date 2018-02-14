/** 
 * The module that handle page elements.
 * 
 * @module ContentPageElements
 */
function ContentPageElements() {}


/**
 * Selected posts of a thread.
 * 
 * @memberof ContentPageElements
 * @static
 * @type {Array<HTMLElement>}
 */
ContentPageElements.activePosts = [];


/**
 * Binds an events to the checkboxes.
 * 
 * @memberof ContentPageElements
 * @static
 * 
 * @param {NodeList<HTMLInputElement>} checkboxes
 * A checkboxes for binding.
 */
ContentPageElements.addEventsToCheckboxes = function(checkboxes) {
    for (let checkbox of checkboxes) {
        checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                this.eventForCheckedCheckbox(event.target);
            } else {
                this.eventForUncheckedCheckbox(event.target);
            }
        });
    }
}


/**
 * Receives a post of the checkbox and
 * adds this post to the active posts.
 * 
 * @memberof ContentPageElements
 * @static
 * 
 * @param {HTMLInputElement} checkbox 
 */
ContentPageElements.eventForCheckedCheckbox = function(checkbox) {
    const post = ContentPageElements.getPostOfCheckbox(checkbox);
    ContentPageElements.activePosts.push(post);
}


/**
 * Receives a post of the checkbox and
 * removes this post from the active posts.
 * 
 * @memberof ContentPageElements
 * @static
 * 
 * @param {HTMLInputElement} checkbox 
 */
ContentPageElements.eventForUncheckedCheckbox = function(checkbox) {
    const post = ContentPageElements.getPostOfCheckbox(checkbox);
    const index = this.activePosts.indexOf(post);

    if (index !== -1) {
        ContentPageElements.activePosts.splice(index, 1);
    }
}


/**
 * Gets a post of the checkbox.
 * 
 * @memberof ContentPageElements
 * @static
 * 
 * @param {HTMLInputElement} checkbox
 * 
 * @returns {HTMLElement} A post (DIV).
 */
ContentPageElements.getPostOfCheckbox = function(checkbox) {
    return ContentAPI.getParent(checkbox, (element) => {
        return (
            (element.className === 'post-wrapper') || 
            (element.className === 'oppost-wrapper')
        );
    });
}
