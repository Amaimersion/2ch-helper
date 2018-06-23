export abstract class DOMLoaded {
    public static runFunction(method: (...args: any[]) => any): void {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", method);
        } else {
            method();
        }
    }
}
