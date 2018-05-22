export class DOMLoaded {
    static runFunction(method: (...args: any[]) => any): void {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", method);
        } else {
            method();
        }
    }
}
