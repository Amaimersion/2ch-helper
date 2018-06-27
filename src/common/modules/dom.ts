/**
 * Handles DOMContentLoaded requests.
 */
export abstract class DOMLoaded {
    /**
     * Runs a method when the page is loaded.
     *
     * @param method The method for execution.
     */
    public static runFunction(method: (...args: any[]) => any): void {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", method);
        } else {
            method();
        }
    }
}
