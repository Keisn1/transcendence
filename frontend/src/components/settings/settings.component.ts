import settingsTemplate from "./settings.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import { TwoFactorSetup } from "../twoFactorSetup/twoFactorSetup.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { TwoFactorVerification } from "../twoFactorVerification/twoFactorVerification.ts";

export class Settings extends BaseComponent {
    private twoFactorSetup: TwoFactorSetup | null = null;
    private twoFactorVerification: TwoFactorVerification | null = null; // Add this

    constructor() {
        super("div", "settings-container");
        this.container.innerHTML = settingsTemplate;
        this.renderButtons();
    }

    private renderButtons() {
        const user = AuthService.getInstance().getCurrentUser();
        const buttonsContainer = this.container.querySelector(".buttons-container")!;

        if (user?.twoFaEnabled) {
            buttonsContainer.innerHTML = `
            <button id="disable-2fa-btn" class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Disable 2FA
            </button>
        `;
            const disableBtn = buttonsContainer.querySelector("#disable-2fa-btn") as HTMLButtonElement;
            this.addEventListenerWithCleanup(disableBtn, "click", () => this.handleDisable2FA());
        } else {
            buttonsContainer.innerHTML = `
            <button id="enable-2fa-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                Enable 2FA
            </button>
        `;
            const enableBtn = buttonsContainer.querySelector("#enable-2fa-btn") as HTMLButtonElement;
            this.addEventListenerWithCleanup(enableBtn, "click", () => this.handleEnable2FA());
        }
    }

    private async handleEnable2FA() {
        this.setButtonState("#enable-2fa-btn", true, "Setting up 2FA...");
        const enableBtn = this.container.querySelector("#enable-2fa-btn") as HTMLButtonElement;
        enableBtn.disabled = true;

        try {
            const qrCodeSvg = await AuthController.getInstance().initiate2FA();

            this.twoFactorSetup = new TwoFactorSetup(
                qrCodeSvg,
                () => {
                    this.twoFactorSetup?.destroy();
                    this.twoFactorSetup = null;
                    this.renderButtons();
                },
                () => {
                    this.twoFactorSetup = null;
                    this.renderButtons();
                },
            );

            this.container.appendChild(this.twoFactorSetup.getContainer());
        } catch (error) {
            console.error("Error setting up 2FA:", error);
            const message = error instanceof Error ? error.message : "Failed to initiate 2FA";
            alert(`Failed to initiate 2FA: ${message}`);
            this.renderButtons(); // Reset button state
        }
    }

    private async handleDisable2FA() {
        this.setButtonState("#disable-2fa-btn", true, "Disabling 2FA...");

        this.twoFactorVerification = new TwoFactorVerification(
            "Enter your 2FA code to disable 2FA:",
            async (token) => {
                const authController = AuthController.getInstance();
                await authController.disable2FA(token);

                this.twoFactorVerification?.getContainer().remove();
                this.twoFactorVerification?.destroy();
                this.twoFactorVerification = null;
                this.renderButtons();
                alert("2FA disabled successfully!");
            },
            () => {
                this.twoFactorVerification?.destroy();
                this.twoFactorVerification = null;
                this.renderButtons(); // Reset button state
            },
        );

        this.container.appendChild(this.twoFactorVerification.getContainer());
    }

    private setButtonState(buttonId: string, disabled: boolean, text?: string) {
        const button = this.container.querySelector(buttonId) as HTMLButtonElement;
        if (button) {
            button.disabled = disabled;
            if (text) button.textContent = text;
        }
    }

    destroy(): void {
        this.twoFactorSetup?.destroy();
        this.twoFactorVerification?.destroy(); // Add this
        super.destroy();
    }
}
