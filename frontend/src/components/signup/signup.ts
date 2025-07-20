import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import signupTemplate from "./signup.html?raw";
import type { SignUpBody } from "../../types/auth.types";

export class SignUp extends BaseComponent {
    constructor() {
        super("div", "signup-container");
        this.container.innerHTML = signupTemplate;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const signupForm = this.container.querySelector<HTMLFormElement>("#signup-form")!;
        this.addEventListenerWithCleanup(signupForm, "submit", this.handleSignUp.bind(this));
    }

    private async handleSignUp(e: Event) {
        e.preventDefault();
        const formData = this.getFormData();

        if (!this.validateForm(formData)) return;

        try {
            const authController = AuthController.getInstance();
            await authController.signUp(formData);
        } catch (error) {
            console.error("Sign up failed:", error);
            this.showError("Sign up failed. Please try again.");
        }
    }

    private getFormData(): SignUpBody {
        return {
            username: (document.getElementById("username") as HTMLInputElement).value,
            email: (document.getElementById("email") as HTMLInputElement).value,
            password: (document.getElementById("password") as HTMLInputElement).value,
            confirmPassword: (document.getElementById("confirmPassword") as HTMLInputElement).value,
        };
    }

    private validateForm(data: SignUpBody): boolean {
        if (data.password !== data.confirmPassword) {
            this.showError("Passwords do not match");
            return false;
        }
        if (data.password.length < 6) {
            this.showError("Password must be at least 6 characters");
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
