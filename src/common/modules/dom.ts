/**
 * Any non-async function.
 */
export type Method = (...args: any[]) => any;

/**
 * Handles DOMContentLoaded requests.
 */
export abstract class DOMLoaded {
    /**
     * Runs a method when the page is loaded.
     *
     * @param method The method for execution.
     */
    public static run(method: Method): void {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", method);
        } else {
            method();
        }
    }
}
