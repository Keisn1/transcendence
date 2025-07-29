import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import signupTemplate from "./signup.html?raw";
import { type SignupForm } from "../../types/auth.types.ts";

const MIN_LEN_PASSWORD = 8;

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
        const formData: SignupForm = this.getFormData();

        if (!this.validateForm(formData)) return;

        try {
            const authController = AuthController.getInstance();
            await authController.signUp(formData);
        } catch (error) {
            console.error("Sign up failed:", error);
            this.showError("Sign up failed. Please try again.");
        }
    }

    private getFormData() {
        return {
            username: this.signupForm.querySelector<HTMLInputElement>("#username")!.value,
            email: this.signupForm.querySelector<HTMLInputElement>("#email")!.value,
            password: this.signupForm.querySelector<HTMLInputElement>("#password")!.value,
            confirmPassword: this.signupForm.querySelector<HTMLInputElement>("#confirmPassword")!.value,
        };
    }

    private validateForm(data: any): boolean {
        if (data.password !== data.confirmPassword) {
            this.showError("Passwords do not match");
            return false;
        }
        if (data.password.length < MIN_LEN_PASSWORD) {
            this.showError(`Password must be at least ${MIN_LEN_PASSWORD} characters`);
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

    destroy(): void {
        super.destroy();
    }
}
