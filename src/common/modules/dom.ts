/**
 * Any non-async function.
 */
export type Method = (...args: any[]) => any;
export type CheckMethod = (location: Location) => boolean;

/**
 * Handles DOMContentLoaded requests.
 */
export abstract class DOMLoaded {
    /**
     * Runs a method when the page is loaded.
     *
     * @param method
     * The method for execution.
     *
     * @param ignoreErrors
     * If false, then error will be thrown,
     * else error will be printed.
     * Defaults to `false`.
     *
     * @param checkMethod
     * The check method for location check.
     * It accepts a document location and returns boolean.
     * If false, then the method will be not executed.
     * Defaults to `undefined`.
     */
    public static run(method: Method, ignoreErrors: boolean = false, checkMethod: CheckMethod = undefined): void {
        if (checkMethod && !checkMethod(document.location)) {
            return;
        }

        const mthd = () => {
            try {
                method();
            } catch (error) {
                if (ignoreErrors) {
                    console.error(error);
                } else {
                    throw error;
                }
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", mthd);
        } else {
            mthd();
        }
    }
}
