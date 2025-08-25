import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import signupTemplate from "./signup.html?raw";
import { type SignupForm } from "../../types/auth.types.ts";
import { sanitizeVisibleInput, validateEmail, validateUsername } from "../../utils/validation.ts";

const MIN_LEN_PASSWORD = 8;
const MAX_LEN_PASSWORD = 128; // practical

//  minimum of two character classes
function isStrongPassword(pw: string): boolean {
    const classes = [/[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)];
    const count = classes.filter(Boolean).length;
    return count >= 2; // satisfy two constraints
}

export class SignUp extends BaseComponent {
    private signupForm: HTMLFormElement;

    constructor() {
        super("div", "signup-container");
        this.container.innerHTML = signupTemplate;
        this.signupForm = this.container.querySelector<HTMLFormElement>("#signup-form")!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.signupForm, "submit", this.handleSignUp.bind(this));
    }

    private async handleSignUp(e: Event) {
        e.preventDefault();
        const rawFormData = this.getFormData();
        const sanitized = this.sanitizeForm(rawFormData);

        if (!this.validateForm(sanitized)) return;

        try {
            const authController = AuthController.getInstance();
            await authController.signUp(sanitized);
        } catch (error) {
            console.error("Sign up failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Sign up failed";

            if (errorMessage.includes("already exists") || errorMessage.includes("already taken")) {
                this.showError("Username or email is already taken. Please choose different ones.");
            } else if (errorMessage.includes("UNIQUE constraint")) {
                this.showError("Username or email is already taken. Please choose different ones.");
            } else {
                this.showError(errorMessage);
            }
        }
    }

    private getFormData() {
        return {
            username: this.signupForm.querySelector<HTMLInputElement>("#username")!.value,
            email: this.signupForm.querySelector<HTMLInputElement>("#email")!.value,
            password: this.signupForm.querySelector<HTMLInputElement>("#password")!.value,
            confirmPassword: this.signupForm.querySelector<HTMLInputElement>("#confirmPassword")!.value,
        } as SignupForm;
    }

    private sanitizeForm(raw: SignupForm): SignupForm {
        return {
            username: sanitizeVisibleInput(raw.username),
            email: sanitizeVisibleInput(raw.email),
            password: raw.password,
            confirmPassword: raw.confirmPassword,
        };
    }

    private validateForm(data: SignupForm): boolean {
        const errors: string[] = [];

        // USERNAME
        errors.push(...validateUsername(data.username));

        // EMAIL
        errors.push(...validateEmail(data.email));

        // PASSWORD
        if (data.password.length < MIN_LEN_PASSWORD) {
            errors.push(`Password must be at least ${MIN_LEN_PASSWORD} characters.`);
        }
        if (data.password.length > MAX_LEN_PASSWORD) {
            errors.push(`Password must be at most ${MAX_LEN_PASSWORD} characters.`);
        }
        if (!isStrongPassword(data.password)) {
            errors.push("Password should include multiple character types (uppercase, lowercase, digits, symbols).");
        }

        // confirm password
        if (data.password !== data.confirmPassword) {
            errors.push("Passwords do not match.");
        }

        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }
        return true;
    }

    private showError(message: string) {
        const existingError = this.container.querySelector(".error-message");
        existingError?.remove();

        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-600 text-sm mt-2 text-center";
        errorDiv.textContent = message;

        const form = this.container.querySelector("#signup-form");
        form?.insertAdjacentElement("afterend", errorDiv);
    }

    // show multiple errors
    private showErrors(messages: string[]) {
        const existingError = this.container.querySelector(".error-message");
        existingError?.remove();

        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-600 text-sm mt-2 text-center";

        const ul = document.createElement("ul");
        ul.className = "space-y-1";
        for (const msg of messages) {
            const li = document.createElement("li");
            li.innerHTML = msg;
            ul.appendChild(li);
        }
        errorDiv.appendChild(ul);

        const form = this.container.querySelector("#signup-form");
        form?.insertAdjacentElement("afterend", errorDiv);
    }

    destroy(): void {
        super.destroy();
    }
}
