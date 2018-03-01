/** 
 * The module that handles page elements.
 * 
 * @module ContentPageElements
 */
function ContentPageElements() {}


/**
 * Selected posts of a thread.
 * Cannot contain duplicates.
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
        this.bindCheckbox(checkbox);
    }
}


/**
 * Binds an events to the checkbox.
 * 
 * @memberof ContentPageElements
 * @static
 * 
 * @param {HTMLInputElement} checkbox
 * A checkbox for binding.
 */
ContentPageElements.bindCheckbox = function(checkbox) {
    checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
            this.eventForCheckedCheckbox(event.target);
        } else {
            this.eventForUncheckedCheckbox(event.target);
        }
    });
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
    const post = this.getPostOfCheckbox(checkbox);

    if (!this.activePosts.includes(post)) {
        this.activePosts.push(post);
    }
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
    const post = this.getPostOfCheckbox(checkbox);
    const index = this.activePosts.indexOf(post);

    if (index !== -1) {
        this.activePosts.splice(index, 1);
    }
}


/**
 * Gets a post of the checkbox.
 * 
 * @memberof ContentPageElements
 * @static
 * 
 * @param {HTMLInputElement} checkbox
 * A checkbox for getting a post.
 * 
 * @returns {HTMLElement} 
 * The post (DIV).
 */
ContentPageElements.getPostOfCheckbox = function(checkbox) {
    let post = document.getElementById('post-' + checkbox.value);

    if (!post) {
        const postsClasses = ['post-wrapper', 'oppost-wrapper'];

        post = ContentAPI.getParent(checkbox, (element) => {
            return postsClasses.includes(element.className);
        });
    }

    return post;
}
