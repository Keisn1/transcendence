import AbstractView from "./AbstractView.ts";
import { Navbar } from "../components/navbar/navbar.ts";
import { AuthController } from "../controllers/auth.controller.ts";
export default class extends AbstractView {
    private navbar: Navbar | null = null;

    constructor(router?: any) {
        super(router);
        this.setTitle("GDPR Settings");
    }

    render() {
        this.navbar = new Navbar();
        document.body.appendChild(this.navbar.getContainer());

        const container = document.createElement("div");
        container.id = "gdpr-settings-container";
        container.className = "mx-auto max-w-2xl mt-10 p-8 bg-white rounded-xl shadow";
        container.innerHTML = `
            <h1 class="text-3xl font-bold mb-6 text-gray-900">GDPR Settings</h1>
            <div class="space-y-4">
                <button id="download-data-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Download Personal Data</button>
                <button id="delete-data-btn" class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Personal Data</button>
                <button id="anonymize-data-btn" class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Anonymize Personal Data</button>
            </div>
        `;
        document.body.appendChild(container);

		// Add event listeners for the popup
    document.getElementById("delete-data-btn")?.addEventListener("click", () => {
        showGdprWarning("delete");
    });
    document.getElementById("anonymize-data-btn")?.addEventListener("click", () => {
        showGdprWarning("anonymize");
    });

    }

    destroy() {
        this.navbar?.destroy();
        document.getElementById("navbar-container")?.remove();
        document.getElementById("gdpr-settings-container")?.remove();
        this.navbar = null;
    }
}

function showGdprWarning(action: "delete" | "anonymize") {
    const actionText = action === "delete" ? "delete" : "anonymize";
    const actionVerb = action === "delete" ? "deletion" : "anonymization";
    const message = `
        <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
                <h2 class="text-xl font-bold mb-4">Confirm ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} of Personal Data</h2>
                <p class="mb-6 text-gray-700">
                    By continuing, you acknowledge that your account and all associated personal data will be ${actionText}d in accordance with GDPR compliance regulations.
                    <br><br>
                    After ${actionVerb}, you will be logged out and redirected to the homepage. Your account will be permanently unusable and cannot be recovered.
                </p>
                <button id="confirm-gdpr-action" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2">Continue</button>
                <button id="cancel-gdpr-action" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", message);

    document.getElementById("cancel-gdpr-action")?.addEventListener("click", () => {
        document.querySelector(".fixed.inset-0")?.remove();
    });

    document.getElementById("confirm-gdpr-action")?.addEventListener("click", async () => {
    // Quick check for 2FA status
    const isTwoFAEnabled = localStorage.getItem("isTwoFAEnabled") === "true"; // or get from your user state

    let twoFACode = "";
    if (isTwoFAEnabled) {
        twoFACode = prompt("Enter your 2FA code to confirm this action:") || "";
        if (!twoFACode) return;
    }
        try {


            const response = await fetch("/api/user/gdpr-action", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Add Authorization header if needed, e.g.:
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: JSON.stringify({ action, twoFACode }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Action completed. You will be logged out.");
                // Clear local session, JWT, etc.
				const authController = AuthController.getInstance();
            	authController.logout();
                window.location.href = "/";
            } else {
                alert(result.error || "Action failed.");
            }
        } catch (err) {
            alert("Network error or server unavailable.");
        }

        document.querySelector(".fixed.inset-0")?.remove();
    });
}