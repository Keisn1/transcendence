import { BaseComponent } from "../BaseComponent";
import { TwoFactorVerification } from "../twoFactorVerification/twoFactorVerification";
import { AuthService } from "../../services/auth/auth.service";
import { ProfileService } from "../../services/profile/profile.service";
import passwordChangeTemplate from "./passwordChange.html?raw";

export class PasswordChange extends BaseComponent {
    private currentPasswordInput: HTMLInputElement;
    private newPasswordInput: HTMLInputElement;
    private confirmPasswordInput: HTMLInputElement;
    private changeBtn: HTMLButtonElement;
    private cancelBtn: HTMLButtonElement;
    private twoFactorVerification: TwoFactorVerification | null = null;
    private onClose?: () => void;

    constructor(onClose?: () => void) {
        super("div", "password-change-modal");
        this.onClose = onClose;
        this.container.innerHTML = passwordChangeTemplate;

        this.currentPasswordInput = this.container.querySelector("#current-password")!;
        this.newPasswordInput = this.container.querySelector("#new-password")!;
        this.confirmPasswordInput = this.container.querySelector("#confirm-password")!;
        this.changeBtn = this.container.querySelector("#change-password-submit")!;
        this.cancelBtn = this.container.querySelector("#cancel-password-change")!;

        this.setupEvents();
    }

    private setupEvents() {
        this.addEventListenerWithCleanup(this.changeBtn, "click", () => this.handlePasswordChange());
        this.addEventListenerWithCleanup(this.cancelBtn, "click", () => this.handleClose());
    }

    private async handlePasswordChange() {
        const currentPassword = this.currentPasswordInput.value;
        const newPassword = this.newPasswordInput.value;
        const confirmPassword = this.confirmPasswordInput.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError("Please fill in all fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            this.showError("Password must be at least 8 characters");
            return;
        }

        if (currentPassword === newPassword) {
            this.showError("New password must be different from current password");
            return;
        }

        const authService = AuthService.getInstance();
        const currentUser = authService.getCurrentUser();

        if (currentUser?.twoFaEnabled) {
            this.show2FAVerification(currentPassword, newPassword);
        } else {
            await this.updatePassword(currentPassword, newPassword);
        }
    }

    private show2FAVerification(currentPassword: string, newPassword: string) {
        this.twoFactorVerification = new TwoFactorVerification(
            "Enter your 2FA code to confirm password change:",
            async (token) => {
                try {
                    const authService = AuthService.getInstance();
                    await authService.verify2FA(token);
                    await this.updatePassword(currentPassword, newPassword);
                    this.cleanup2FA();
                } catch (error) {
                    // let TwoFactorVerification show the error, keep modal open
                    console.error("2FA verify failed:", error);
                    throw error; // Let TwoFactorVerification handle error display
                }
            },
            () => {
                this.cleanup2FA();
            },
        );

        // Create a modal wrapper for the 2FA component
        const modalWrapper = document.createElement("div");
        modalWrapper.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]";

        // Style the 2FA container to look like a proper modal
        const twoFAContainer = this.twoFactorVerification.getContainer();
        twoFAContainer.className = "bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4";

        modalWrapper.appendChild(twoFAContainer);

        // Append to document.body so it appears on top of the password modal
        document.body.appendChild(modalWrapper);
    }

    private async updatePassword(currentPassword: string, newPassword: string) {
        try {
            const profileService = ProfileService.getInstance();
            await profileService.updatePassword(currentPassword, newPassword);
            this.showSuccess("Password updated successfully!");
            setTimeout(() => this.handleClose(), 500);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Password update failed";
            this.showError(message);
        }
    }

    private cleanup2FA() {
        if (this.twoFactorVerification) {
            // Find and remove the modal wrapper
            const twoFAContainer = this.twoFactorVerification.getContainer();
            const modalWrapper = twoFAContainer.parentElement;
            if (modalWrapper && modalWrapper.classList.contains("fixed")) {
                modalWrapper.remove();
            } else {
                twoFAContainer.remove();
            }

            this.twoFactorVerification.destroy();
            this.twoFactorVerification = null;
        }
    }

    private handleClose() {
        this.cleanup2FA();
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

        // Insert after the form inputs but before the buttons
        const buttonsDiv = this.container.querySelector(".flex.justify-between");
        if (buttonsDiv) {
            buttonsDiv.insertAdjacentElement("beforebegin", errorDiv);
        } else {
            this.container.appendChild(errorDiv);
        }
    }

    private showSuccess(message: string) {
        this.clearMessages();
        const successDiv = document.createElement("div");
        successDiv.className = "success-message text-green-600 text-sm mt-2 text-center";
        successDiv.textContent = message;

        // Insert after the form inputs but before the buttons
        const buttonsDiv = this.container.querySelector(".flex.justify-between");
        if (buttonsDiv) {
            buttonsDiv.insertAdjacentElement("beforebegin", successDiv);
        } else {
            this.container.appendChild(successDiv);
        }
    }

    private clearMessages() {
        this.container.querySelectorAll(".error-message, .success-message").forEach((el) => el.remove());
    }

    show() {
        document.body.appendChild(this.container);
    }
}
