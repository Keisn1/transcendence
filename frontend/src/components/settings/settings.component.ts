import settingsTemplate from "./settings.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import { TwoFactorSetup } from "../twoFactorSetup/twoFactorSetup.ts";

export class Settings extends BaseComponent {
    private enable2FABtn: HTMLButtonElement;
    private twoFactorSetup: TwoFactorSetup | null = null;

    constructor() {
        super("div", "settings-container");
        this.container.innerHTML = settingsTemplate;
        this.enable2FABtn = this.container.querySelector<HTMLButtonElement>("#enable-2fa-btn")!;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.enable2FABtn, "click", () => this.handleEnable2FA());
    }

    private async handleEnable2FA() {
        try {
            const authController = AuthController.getInstance();
            const qrCodeSvg = await authController.initiate2FA();

            this.twoFactorSetup = new TwoFactorSetup(qrCodeSvg, () => {
                // Cleanup when 2FA setup is complete
                this.twoFactorSetup?.destroy();
                this.twoFactorSetup = null;
            });

            this.container.appendChild(this.twoFactorSetup.getContainer());
        } catch (error) {
            console.error("Error setting up 2FA:", error);
            const message = error instanceof Error ? error.message : "Failed to initiate 2FA";
            alert(`Failed to initiate 2FA: ${message}`);
        }
    }

    destroy(): void {
        this.twoFactorSetup?.destroy();
        super.destroy();
    }
}
