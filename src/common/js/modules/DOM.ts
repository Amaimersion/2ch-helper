export class DOMLoaded {
    static runFunction(method: () => any): void {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", method);
        } else {
            method();
        }
    }
}
