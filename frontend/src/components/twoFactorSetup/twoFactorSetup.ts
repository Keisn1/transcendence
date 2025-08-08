import { BaseComponent } from "../BaseComponent.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import twoFactorSetupTemplate from "./twoFactorSetup.html?raw";

export class TwoFactorSetup extends BaseComponent {
    private verifyBtn: HTMLButtonElement;
    private tokenInput: HTMLInputElement;
    private closeBtn: HTMLButtonElement;
    private onComplete?: () => void;
    private onClose?: () => void;

    constructor(qrCodeSvg: string, onComplete?: () => void, onClose?: () => void) {
        super("div", "two-factor-setup");
        this.onComplete = onComplete;
        this.onClose = onClose;

        this.container.innerHTML = twoFactorSetupTemplate.replace("{{qrCodeSvg}}", qrCodeSvg);

        this.verifyBtn = this.container.querySelector("#verify-2fa-btn")!;
        this.tokenInput = this.container.querySelector("#twofa-token")!;
        this.closeBtn = this.container.querySelector("#close-2fa-setup")!;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.verifyBtn, "click", () => this.handleVerify());
        this.addEventListenerWithCleanup(this.closeBtn, "click", () => this.handleClose());
    }

    private handleClose() {
        console.log("handle close button");

        // Check if 2FA was successfully enabled and trigger completion
        if (this.container.querySelector(".success-message") && this.onComplete) {
            this.onComplete();
        }

        if (this.onClose) {
            this.onClose();
        }
        this.container.remove();
        this.destroy();
    }

    private async handleVerify() {
        try {
            const token = this.tokenInput.value.trim();

            if (!token) {
                this.showError("Please enter the 2FA code.");
                return;
            }

            this.verifyBtn.disabled = true; // Disable during verification

            const authController = AuthController.getInstance();
            await authController.complete2FA(token);

            this.showSuccess("2FA enabled successfully!");
        } catch (error) {
            console.error("Error verifying 2FA:", error);
            const message = error instanceof Error ? error.message : "Invalid 2FA code";
            this.showError(message);

            this.verifyBtn.disabled = false;
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
