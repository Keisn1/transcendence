import { BaseComponent } from "../BaseComponent";
import modalTemplate from "./gdprWarningModal.html?raw";
import { TwoFactorVerification } from "../twoFactorVerification/twoFactorVerification";
import { AuthService } from "../../services/auth/auth.service";

export class GdprWarningModal extends BaseComponent {
    private confirmBtn: HTMLButtonElement;
    private cancelBtn: HTMLButtonElement;
    private onConfirm?: (action: "delete" | "anonymize") => void;
    private action: "delete" | "anonymize";
    private twoFactorVerification: TwoFactorVerification | null = null;

    constructor(action: "delete" | "anonymize", onConfirm?: (action: "delete" | "anonymize") => void) {
        super("div", "gdpr-warning-modal");
        this.action = action;
        this.onConfirm = onConfirm;

        const actionText = action === "delete" ? "delete" : "anonymize";
        const actionVerb = action === "delete" ? "deletion" : "anonymization";

        this.container.innerHTML = modalTemplate
            .replace(/{{actionText}}/g, actionText)
            .replace(/{{actionVerb}}/g, actionVerb)
            .replace(/{{actionTextCapitalized}}/g, actionText.charAt(0).toUpperCase() + actionText.slice(1));

        this.confirmBtn = this.container.querySelector("#confirm-gdpr-action")!;
        this.cancelBtn = this.container.querySelector("#cancel-gdpr-action")!;

        this.setupEvents();
    }

    private setupEvents() {
        this.addEventListenerWithCleanup(this.cancelBtn, "click", () => {
            this.hide();
        });

        this.addEventListenerWithCleanup(this.confirmBtn, "click", () => {
            this.handleConfirm();
        });
    }

    private handleConfirm() {
        // Check if user has 2FA enabled
        const authService = AuthService.getInstance();
        const currentUser = authService.getCurrentUser();

        if (currentUser?.twoFaEnabled) {
            this.show2FAVerification();
        } else {
            this.proceedWithAction();
        }
    }

    private show2FAVerification() {
        // Hide the GDPR modal temporarily
        this.container.style.display = "none";

        this.twoFactorVerification = new TwoFactorVerification(
            "Enter your 2FA code to confirm this action:",
            async (token) => {
                try {
                    const authService = AuthService.getInstance();
                    await authService.verify2FA(token);
                    this.cleanup2FA();
                    this.proceedWithAction();
                } catch (error) {
                    // let TwoFactorVerification show the error, keep modal open
                    console.error("2FA verify failed:", error);
                    throw error; // Let TwoFactorVerification handle error display
                }
            },
            () => {
                // User cancelled 2FA verification, show GDPR modal again
                this.cleanup2FA();
                this.container.style.display = "flex";
            },
        );

        // Create a modal wrapper with overlay
        const modalWrapper = document.createElement("div");
        modalWrapper.className = "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[60]";

        // Style the 2FA container to look like a proper modal
        const twoFAContainer = this.twoFactorVerification.getContainer();
        twoFAContainer.className = "bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4";

        modalWrapper.appendChild(twoFAContainer);

        // Append to document.body so it appears on top
        document.body.appendChild(modalWrapper);
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

    private proceedWithAction() {
        if (this.onConfirm) {
            this.onConfirm(this.action);
        }
        this.hide();
    }

    show() {
        document.body.appendChild(this.container);
    }

    hide() {
        this.cleanup2FA();
        this.container.remove();
        this.destroy();
    }
}
