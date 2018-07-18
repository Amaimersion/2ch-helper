/**
 * Handles inject requests.
 */
export abstract class Inject {
    /**
     * Injects a JS script into the active page.
     *
     * @param parameters The inject details.
     */
    public static script(parameters: chrome.tabs.InjectDetails): Promise<void> {
        return new Promise((resolve) => {
            chrome.tabs.executeScript(parameters, (result) => {
                if (result) {
                    return resolve();
                }

                throw new Error("Could not inject a script.");
            });
        });
    }
}
