import settingsTemplate from "./settings.html?raw";
import { BaseComponent } from "../BaseComponent.ts";
import { AuthService } from "../../services/auth/auth.service.ts";

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
        try {
            const token = this.authService.getAuthToken();
            console.log("Token from AuthService:", token ? "Token exists" : "No token found");
            
            if (!token) {
                alert("Please log in first.");
                return;
            }

            console.log("Making request to /api/auth/2fa/init");
            const response = await fetch("/api/auth/2fa/init", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                
                let errorMessage = "Unknown error";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorJson.message || "Unknown error";
                } catch (e) {
                    errorMessage = errorText || `HTTP ${response.status}`;
                }
                
                alert(`Failed to initiate 2FA: ${errorMessage}`);
                return;
            }

            const { qrCodeSvg } = await response.json();
            this.showQRCodeSetup(qrCodeSvg, token);
        } catch (error) {
            console.error("Error setting up 2FA:", error);
            alert("An error occurred while setting up 2FA.");
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
            await this.handleVerify2FA(qrContainer, token);
        });
    }

    private async handleVerify2FA(qrContainer: HTMLElement, token: string) {
        try {
            const tfaTokenInput = qrContainer.querySelector<HTMLInputElement>("#twofa-token")!;
            const tfaToken = tfaTokenInput.value;

            if (!tfaToken) {
                alert("Please enter the 2FA code.");
                return;
            }

            const verifyResponse = await fetch("/api/auth/2fa/complete", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ token: tfaToken }),
            });

            if (verifyResponse.ok) {
                alert("2FA enabled successfully!");
                qrContainer.remove();
            } else {
                const error = await verifyResponse.json();
                alert(`Invalid 2FA code: ${error.error || 'Please try again.'}`);
            }
        } catch (error) {
            console.error("Error verifying 2FA:", error);
            alert("An error occurred while verifying 2FA.");
        }
    }

    destroy(): void {
        super.destroy();
    }
}
