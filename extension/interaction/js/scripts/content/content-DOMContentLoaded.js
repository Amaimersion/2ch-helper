function ContentDOMContentLoaded() {}


ContentDOMContentLoaded.main = function() {
    this.bindCheckboxes();
}


ContentDOMContentLoaded.bindCheckboxes = function() {
    const thread = ContentAPI.getThread();    
    const checkboxes = thread.querySelectorAll('input[type="checkbox"]');
    ContentPageElements.addEventsToCheckboxes(checkboxes);
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    ContentDOMContentLoaded.main();
}
