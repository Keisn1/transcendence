import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import signupTemplate from "./signup.html?raw";
import { type SignupForm } from "../../types/auth.types.ts";

const MIN_LEN_USERNAME = 3;
const MIN_LEN_PASSWORD = 8;
const MAX_LEN_PASSWORD = 128; // practical
const MAX_LEN_USERNAME = 20; // practical
const MIN_LEN_EMAIL = 3; // RFC 5321
const MAX_LEN_EMAIL = 254; // RFC 5321
const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF]/g;

// trim whitespace, zero-width chars and NFKC normalisation
function sanitizeVisibleInput(input: string): string {
    // Trim, remove zero-width/control chars, normalize to NFKC for consistency
    return input.trim().replace(ZERO_WIDTH_RE, "").normalize("NFKC");
}

// allow letters, numbers, underscore, dot and dash
function isValidUsername(username: string): boolean {
    const re = /^[A-Za-z0-9._-]+$/;
    return re.test(username);
}

function isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

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
        if (data.username.length < MIN_LEN_USERNAME) {
            errors.push(`Username must be at least ${MIN_LEN_USERNAME} characters.`);
        }
        if (data.username.length > MAX_LEN_USERNAME) {
            errors.push(`Username is too long. Maximum ${MAX_LEN_USERNAME} characters.`);
        }
        if (!isValidUsername(data.username)) {
            errors.push("Username contains invalid characters. Use letters, numbers, '.', '_' or '-'.");
        }

        // EMAIL
        if (data.email.length > MAX_LEN_EMAIL) {
            errors.push(`Email is too long. Maximum ${MAX_LEN_EMAIL} characters.`);
        } else if (data.email.length < MIN_LEN_EMAIL) {
            errors.push(`Email is too short. Minimum ${MAX_LEN_EMAIL} characters.`);
        } else if (!isValidEmail(data.email)) {
            errors.push("Email format looks invalid.");
        }

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
