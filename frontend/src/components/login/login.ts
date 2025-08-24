import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import { TwoFactorVerification } from "../twoFactorVerification/twoFactorVerification.ts";
import loginTemplate from "./login.html?raw";

export class Login extends BaseComponent {
    private loginForm: HTMLFormElement;
    private submitBtn: HTMLButtonElement;
    private emailInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;
    private currentVerification: TwoFactorVerification | null = null;

    constructor() {
        super("div", "login-container");
        this.container.innerHTML = loginTemplate;

        this.loginForm = this.container.querySelector<HTMLFormElement>("#login-form")!;
        this.submitBtn = this.container.querySelector<HTMLButtonElement>('button[type="submit"]')!;
        this.emailInput = this.container.querySelector<HTMLInputElement>("#email")!;
        this.passwordInput = this.container.querySelector<HTMLInputElement>("#password")!;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.loginForm, "submit", this.handleLogin.bind(this));
    }

    private async handleLogin(e: Event) {
        e.preventDefault();

        // Disable submit button during login attempt
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = "Signing in...";

        try {
            const authController = AuthController.getInstance();
            const result = await authController.login({
                email: this.emailInput.value,
                password: this.passwordInput.value,
            });

            // Check if 2FA is required
            if (result.requires2FA) {
                this.show2FAVerification();
            } else {
                // Login successful - button will be cleaned up when component destroys
            }
        } catch (error) {
            console.error("Login attempt failed:", {
                email: this.emailInput.value,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : null,
            });
            this.showError("Login failed. Please check your credentials.");

            // Re-enable form on error
            this.setFormDisabled(false);
        }
    }

    private show2FAVerification() {
        // Disable entire form during 2FA
        this.setFormDisabled(true);

        this.currentVerification = new TwoFactorVerification(
            "Enter your 2FA code to complete login:",
            async (token) => {
                try {
                    const authController = AuthController.getInstance();
                    await authController.complete2FALogin(token);
                    // AuthController handles navigation to "/"
                    this.cleanup2FA();
                } catch (error) {
                    // Let TwoFactorVerification handle error display
                    throw error;
                }
            },
            () => {
                // User cancelled - clear pending login and re-enable form
                const authController = AuthController.getInstance();
                authController.clearPendingLogin();
                this.cleanup2FA();
                this.setFormDisabled(false); // Re-enable form
            },
        );

        this.container.appendChild(this.currentVerification.getContainer());
    }

    private setFormDisabled(disabled: boolean) {
        this.emailInput.disabled = disabled;
        this.passwordInput.disabled = disabled;
        this.submitBtn.disabled = disabled;

        if (disabled) {
            this.submitBtn.textContent = "2FA Required";
            this.emailInput.classList.add("bg-gray-100", "cursor-not-allowed");
            this.passwordInput.classList.add("bg-gray-100", "cursor-not-allowed");
            this.submitBtn.classList.add("cursor-not-allowed");
        } else {
            this.submitBtn.textContent = "Sign in";
            this.emailInput.classList.remove("bg-gray-100", "cursor-not-allowed");
            this.passwordInput.classList.remove("bg-gray-100", "cursor-not-allowed");
            this.submitBtn.classList.remove("cursor-not-allowed");
        }
    }

    private cleanup2FA() {
        if (this.currentVerification) {
            this.currentVerification.getContainer().remove();
            this.currentVerification.destroy();
            this.currentVerification = null;
        }
    }

    private showError(message: string) {
        // Remove existing error
        const existingError = this.container.querySelector("#error-message");
        existingError?.remove();

        // Create error element
        const errorDiv = document.createElement("div");
        errorDiv.id = "error-message";
        errorDiv.className = "text-red-600 text-sm mt-2 text-center";
        errorDiv.textContent = message;

        // Insert after form
        this.loginForm.insertAdjacentElement("afterend", errorDiv);
    }

    destroy(): void {
        this.cleanup2FA();
        super.destroy();
    }
}
