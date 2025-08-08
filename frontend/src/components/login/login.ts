import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import { TwoFactorVerification } from "../twoFactorVerification/twoFactorVerification.ts";
import loginTemplate from "./login.html?raw";

export class Login extends BaseComponent {
    private loginForm: HTMLFormElement;

    constructor() {
        super("div", "login-container");
        this.container.innerHTML = loginTemplate;
        this.loginForm = this.container.querySelector<HTMLFormElement>("#login-form")!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.loginForm, "submit", this.handleLogin.bind(this));
    }

    private async handleLogin(e: Event) {
        e.preventDefault();

        try {
            const authController = AuthController.getInstance();
            const result = await authController.login({
                email: this.loginForm.querySelector<HTMLInputElement>("#email")!.value,
                password: this.loginForm.querySelector<HTMLInputElement>("#password")!.value,
            });

            // Check if 2FA is required
            if (result.requires2FA) {
                this.show2FAVerification();
            }
            // If not requires2FA, authController already navigated to "/"
        } catch (error) {
            console.error("Login attempt failed:", {
                email: this.loginForm.querySelector<HTMLInputElement>("#email")!.value,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : null,
            });
            this.showError("Login failed. Please check your credentials.");
        }
    }

    private show2FAVerification() {
        const verification = new TwoFactorVerification(
            "Enter your 2FA code to complete login:",
            async (token) => {
                try {
                    const authController = AuthController.getInstance();
                    await authController.complete2FALogin(token);
                    // AuthController handles navigation to "/"
                    verification.getContainer().remove();
                    verification.destroy();
                } catch (error) {
                    throw error; // Let TwoFactorVerification handle error display
                }
            },
            () => {
                // User cancelled - clear pending login
                const authController = AuthController.getInstance();
                authController.clearPendingLogin();
                verification.getContainer().remove();
                verification.destroy();
            },
        );

        this.container.appendChild(verification.getContainer());
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
        super.destroy();
    }
}
