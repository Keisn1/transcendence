import settingsTemplate from "./settings.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";
import { TwoFAService } from "../../services/2fa/TwoFAService.ts";

export class Settings extends BaseComponent {
    private enable2FABtn: HTMLButtonElement;
    private authService: AuthService;

    constructor() {
        super("div", "settings-container");
        this.container.innerHTML = settingsTemplate;
        this.enable2FABtn = this.container.querySelector<HTMLButtonElement>("#enable-2fa-btn")!;
        this.authService = AuthService.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.enable2FABtn, "click", this.handleEnable2FA.bind(this));
    }

    private async handleEnable2FA() {
        const token = this.authService.getAuthToken();
        if (!token) {
            alert("Please log in first.");
            return;
        }

        try {
            const qrCodeSvg = await TwoFAService.init2FA(token);
            this.showQRCodeSetup(qrCodeSvg, token);
        } catch (error) {
            alert(`Failed to initiate 2FA: ${error}`);
        }
    }

    private showQRCodeSetup(qrCodeSvg: string, token: string) {
        const qrContainer = document.createElement("div");
        qrContainer.className = "mt-6 p-4 bg-gray-100 rounded";
        qrContainer.innerHTML = `
            <p class="mb-4 font-medium text-center">Scan this QR code with your authenticator app:</p>
            <div class="flex justify-center mb-6">
                <div style="width: 200px; height: 200px;" class="border rounded bg-white p-2">
                    ${qrCodeSvg}
                </div>
            </div>
            <div class="flex flex-col items-center space-y-4 max-w-sm mx-auto">
                <input type="text" id="twofa-token" placeholder="Enter 2FA code" class="p-2 border rounded w-full text-center" />
                <button id="verify-2fa-btn" class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Verify</button>
            </div>
        `;

        this.container.appendChild(qrContainer);

        const verifyBtn = qrContainer.querySelector<HTMLButtonElement>("#verify-2fa-btn")!;
        this.addEventListenerWithCleanup(verifyBtn, "click", async () => {
            const tfaTokenInput = qrContainer.querySelector<HTMLInputElement>("#twofa-token")!;
            const tfaToken = tfaTokenInput.value;
            try {
                await TwoFAService.complete2FA(token, tfaToken);
                alert("2FA enabled successfully!");
                qrContainer.remove();
            } catch (error) {
                alert(`Invalid 2FA code: ${error}`);
            }
        });
    }

    destroy(): void {
        super.destroy();
    }
}
