// components/twoFactorVerification/twoFactorVerification.ts
import { BaseComponent } from "../BaseComponent.ts";
import twoFactorVerificationTemplate from "./twoFactorVerification.html?raw";

export class TwoFactorVerification extends BaseComponent {
    private verifyBtn: HTMLButtonElement;
    private tokenInput: HTMLInputElement;
    private closeBtn: HTMLButtonElement;
    private onVerify?: (token: string) => Promise<void>;
    private onClose?: () => void;

    constructor(title: string, onVerify?: (token: string) => Promise<void>, onClose?: () => void) {
        super("div", "two-factor-verification");
        this.onVerify = onVerify;
        this.onClose = onClose;

        this.container.innerHTML = twoFactorVerificationTemplate.replace("{{title}}", title);

        this.verifyBtn = this.container.querySelector("#verify-token-btn")!;
        this.tokenInput = this.container.querySelector("#token-input")!;
        this.closeBtn = this.container.querySelector("#close-verification")!;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.verifyBtn, "click", () => this.handleVerify());
        this.addEventListenerWithCleanup(this.closeBtn, "click", () => this.handleClose());
    }

    private async handleVerify() {
        const token = this.tokenInput.value.trim();
        if (!token) {
            this.showError("Please enter the 2FA code.");
            return;
        }

        this.verifyBtn.disabled = true;

        try {
            if (this.onVerify) {
                await this.onVerify(token);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Verification failed";
            this.showError(message);
            this.verifyBtn.disabled = false;
        }
    }

    private handleClose() {
        if (this.onClose) {
            this.onClose();
        }
        this.container.remove();
        this.destroy();
    }

    private showError(message: string) {
        this.clearMessages();
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-600 text-sm mt-2 text-center";
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
    }

    private clearMessages() {
        this.container.querySelectorAll(".error-message").forEach((el) => el.remove());
    }
}
