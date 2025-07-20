import { AuthController } from "../../controllers/auth.controller.ts";
import { BaseComponent } from "../BaseComponent";
import loginTemplate from "./login.html?raw";

export class Login extends BaseComponent {
    constructor() {
        super("div", "login-container");
        this.container.innerHTML = loginTemplate;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        const loginForm = this.container.querySelector<HTMLFormElement>("#login-form")!;
        this.addEventListenerWithCleanup(loginForm, "submit", this.handleLogin.bind(this));
    }

    private async handleLogin(e: Event) {
        e.preventDefault();
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        try {
            const authController = AuthController.getInstance();
            await authController.login({ email: email, password: password });
        } catch (error) {
            console.error("Login attempt failed:", {
                email: email,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : null,
            });
            this.showError("Login failed. Please check your credentials.");
        }
    }

    private showError(message: string) {
        // Remove existing error
        const existingError = this.container.querySelector(".error-message");
        existingError?.remove();

        // Create error element
        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-600 text-sm mt-2 text-center";
        errorDiv.textContent = message;

        // Insert after form
        const form = this.container.querySelector("#login-form");
        form?.insertAdjacentElement("afterend", errorDiv);
    }

    destroy(): void {
        super.destroy();
    }
}
