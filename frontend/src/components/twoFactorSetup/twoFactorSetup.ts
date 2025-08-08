import { BaseComponent } from "../BaseComponent.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import twoFactorSetupTemplate from "./twoFactorSetup.html?raw";

export class TwoFactorSetup extends BaseComponent {
    private verifyBtn: HTMLButtonElement;
    private tokenInput: HTMLInputElement;
    private onComplete?: () => void;

    constructor(qrCodeSvg: string, onComplete?: () => void) {
        super("div", "two-factor-setup");
        this.onComplete = onComplete;

        this.container.innerHTML = twoFactorSetupTemplate.replace("{{qrCodeSvg}}", qrCodeSvg);

        this.verifyBtn = this.container.querySelector("#verify-2fa-btn")!;
        this.tokenInput = this.container.querySelector("#twofa-token")!;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.verifyBtn, "click", () => this.handleVerify());
    }

    private async handleVerify() {
        try {
            const token = this.tokenInput.value.trim();

            if (!token) {
                this.showError("Please enter the 2FA code.");
                return;
            }

            const authController = AuthController.getInstance();
            await authController.complete2FA(token);

            this.showSuccess("2FA enabled successfully!");

            if (this.onComplete) {
                this.onComplete();
            }
        } catch (error) {
            console.error("Error verifying 2FA:", error);
            const message = error instanceof Error ? error.message : "Invalid 2FA code";
            this.showError(message);
        }
    }

    private showError(message: string) {
        this.clearMessages();
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-600 text-sm mt-2 text-center";
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
    }

    private showSuccess(message: string) {
        this.clearMessages();
        const successDiv = document.createElement("div");
        successDiv.className = "success-message text-green-600 text-sm mt-2 text-center";
        successDiv.textContent = message;
        this.container.appendChild(successDiv);
    }

    private clearMessages() {
        this.container.querySelectorAll(".error-message, .success-message").forEach((el) => el.remove());
    }

    destroy(): void {
        super.destroy();
    }
}
