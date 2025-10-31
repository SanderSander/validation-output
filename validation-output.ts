// The lib.dom.d.ts is not complete for the CustomStateSet interface
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CustomStateSet {
    add(token: string): void;

    delete(token: string): void;

    has(token: string): boolean;
}

class ValidationOutput extends HTMLElement {
    #template: DocumentFragment | null = null;
    #for!: HTMLInputElement;
    #internals: ElementInternals;
    #interacted = false;
    #serverError: string | undefined = undefined;
    #serverErrorValue: string | undefined = undefined;

    constructor() {
        super();
        this.#internals = this.attachInternals();
    }

    connectedCallback() {
        this.#initializeInput();
        this.#initializeUsability();
        this.#initializeTemplate();
        this.#initializeServerError();

        this.#for.addEventListener("input", this.#handleInput);
        this.#for.addEventListener("change", this.#handleChange);
        this.#for.addEventListener("invalid", this.#handleInvalid);
    }

    disconnectedCallback() {
        this.#for.removeEventListener("input", this.#handleInput);
        this.#for.removeEventListener("change", this.#handleChange);
        this.#for.removeEventListener("invalid", this.#handleInvalid);
    }

    #initializeServerError() {
        if (!this.innerHTML.trim()) return;

        this.#serverError = this.innerHTML;
        this.#serverErrorValue = this.#for.value;
        this.#for.setCustomValidity(this.#serverError);
        this.#internals.states.add("has-error");

        // This is a hack to make the server-side validation error stylable in the input element.
        this.#for.setAttribute("data-server-invalid", "true");
    }

    #initializeInput() {
        if (!this.hasAttribute("for")) {
            throw new Error('ValidationOutput: Missing "for" attribute');
        }

        const _for = document.getElementById(
            this.getAttribute("for") as string,
        );
        if (!_for) {
            throw new Error(
                "ValidationOutput: No element with ID " +
                    this.getAttribute("for"),
            );
        }

        this.#for = _for as HTMLInputElement;
    }

    #initializeUsability() {
        // Add reasonable defaults for screen readers
        if (!this.hasAttribute("aria-live")) {
            this.setAttribute("aria-live", "polite");
        }
        if (!this.hasAttribute("role")) {
            this.setAttribute("role", "alert");
        }
    }

    #initializeTemplate() {
        if (!this.hasAttribute("template")) return;

        const template = document.getElementById(
            this.getAttribute("template") as string,
        );
        if (!(template instanceof HTMLTemplateElement)) {
            throw new Error("Target template must be a <template> element");
        }

        this.#template = template.content.cloneNode(true) as DocumentFragment;
    }

    #handleInput = () => {
        // The form could be tried to be submitted but failed on other inputs.
        // In this case, our #for target is flagged as "interacted" and gets the :user-invalid state.
        if (this.#for.matches(":user-invalid")) {
            this.#interacted = true;
        }

        // User did not interact yet with the input element; this means that :user-invalid state is not applied yet.
        if (!this.#interacted) {
            return;
        }
        this.#validate();
    };

    #handleChange = () => {
        this.#interacted = true;
        this.#validate();
    };

    #handleInvalid = (e: Event) => {
        this.#interacted = true;
        this.#validate();
        // Prevent the default validation message from being displayed
        e.preventDefault();
    };

    #validate() {
        this.#for.setCustomValidity("");

        // Remove the server-side validation error fix, from this point we can use the `:user-invalid` state.`
        if (this.#for.hasAttribute("data-server-invalid")) {
            this.#for.removeAttribute("data-server-invalid");
        }

        // Check if the user reverted to the original server-rejected value
        if (this.#serverError && this.#for.value === this.#serverErrorValue) {
            this.#for.setCustomValidity(this.#serverError);
            this.#setErrorMessage(this.#serverError);
            return;
        }

        // The first :user-invalid state is applied on the "change" event.
        // After the first :user-invalid state is applied, the state can be reapplied from the "input" event.
        // E.g.: It starts functioning as the :invalid state.
        if (this.#for.matches(":user-invalid")) {
            this.#setErrorMessage(
                this.#getCustomValidationMessage(this.#for.validity) ??
                    this.#for.validationMessage,
            );
            return;
        }

        // We don't remove the error message, we just remove the `has-error` state.
        // This makes it easier to style and animate the error message.
        this.#internals.states.delete("has-error");
    }

    #setErrorMessage(message: string | DocumentFragment) {
        this.innerHTML = "";
        if (message instanceof DocumentFragment) {
            this.appendChild(message);
        } else {
            this.innerHTML = message;
        }

        this.#internals.states.add("has-error");
    }

    #getCustomValidationMessage(
        validity: ValidityState,
    ): DocumentFragment | null {
        if (!this.#template) return null;

        for (const key in validity) {
            if (!validity[key as keyof ValidityState]) continue;

            const template = this.#template.querySelector(
                `template[data-validity="${key}"]`,
            ) as HTMLTemplateElement | null;

            if (template) {
                return template.content.cloneNode(true) as DocumentFragment;
            }
        }

        return null;
    }
}

customElements.define("validation-output", ValidationOutput);
