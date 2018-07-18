import {Script} from "@modules/communication";
import {API} from "@modules/api";


/**
 * Handles a statistics requests.
 */
export abstract class Statistics {
    protected static focusOnTime: number = undefined;
    protected static focusOffTime: number = undefined;

    /**
     * Runs when the page is loaded.
     */
    public static main(): void {
        if (document.hasFocus()) {
            this.focusEvent();
        }

        this.bindEvents();
    }

    /**
     * Binds a statistics events.
     */
    protected static bindEvents(): void {
        window.addEventListener("focus", () => {this.focusEvent()});
        window.addEventListener("blur", () => {this.blurEvent()});
        window.addEventListener("beforeunload", () => {this.beforeUnloadEvent()});
    }

    /**
     * The event when a page is get focus.
     */
    protected static focusEvent(): void {
        this.focusOnTime = new Date().getTime();
    }

    /**
     * The event when a page is lost focus.
     */
    protected static async blurEvent(): Promise<void> {
        if (!this.focusOnTime) {
            throw new Error("Focus on time is undefined.");
        }

        this.focusOffTime = new Date().getTime();

        const response = await Script.Content.sendMessageToBackground({
            type: "command",
            command: "updateStatistics",
            data: {
                focusOnTime: this.focusOnTime,
                focusOffTime: this.focusOffTime
            }
        });

        this.focusOnTime = undefined;
        this.focusOffTime = undefined;

        if (API.isErrorResponse(response)) {
            throw new Error(response.errorText || "The background script cannot handle a focus time.");
        }
    }

    /**
     * The event when a page is get closed.
     */
    protected static beforeUnloadEvent(): void {
        if (this.focusOnTime) {
            this.blurEvent();
        }
    }
}
