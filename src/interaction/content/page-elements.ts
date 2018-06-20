import {DOMLoaded} from "@modules/dom";
import {API} from "@modules/api";


abstract class PageElements {
    protected static activePosts: Set<HTMLDivElement> = undefined;

    public static main(): void {
        this.activePosts = new Set<HTMLDivElement>();
        this.bindCheckboxes();
    }

    protected static bindCheckboxes(): void {
        const thread = API.getThread();
        const checkboxes = API.getElements<HTMLInputElement>({
            selectors: [`input[type="checkbox"]`],
            dcmnt: thread,
            errorMessage: "Could not find a thread checkboxes."
        });

        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener("change", (event) => {
                if ((event.target as HTMLInputElement).checked) {
                    this.eventForCheckedCheckbox(checkbox);
                } else {
                    this.eventForUncheckedCheckbox(checkbox);
                }
            });
        });
    }

    protected static eventForCheckedCheckbox(checkbox: HTMLInputElement): void {
        const post = this.getPostOfCheckbox(checkbox);
        this.activePosts.add(post);
        console.log(this.activePosts);
    }

    protected static eventForUncheckedCheckbox(checkbox: HTMLInputElement): void {
        const post = this.getPostOfCheckbox(checkbox);
        const status = this.activePosts.delete(post);
        console.log(this.activePosts);

        if (!status) {
            throw new Error("Could not find a post in the set.");
        }
    }

    protected static getPostOfCheckbox(checkbox: HTMLInputElement): HTMLDivElement {
        const value = checkbox.value;
        const post = API.getElement<HTMLDivElement>({
            selectors: [`#post-${value}`],
            errorMessage: `Could not find a post for the value "${value}".`
        });

        return post;
    }

    protected static turnOffActivePosts(): void {
        for (let post of this.activePosts) {
            const checkbox = API.getElement<HTMLInputElement>({
                selectors: [`input[type="checkbox"]`],
                dcmnt: post
            });
            checkbox.checked = false;
        }

        this.activePosts.clear();
    }
}


DOMLoaded.runFunction(() => PageElements.main());
