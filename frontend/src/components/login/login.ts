import { AuthController } from "../../controllers/AuthController";
import type Router from "../../router";
import { BaseComponent } from "../BaseComponent";
import loginTemplate from "./login.html?raw";

export class Login extends BaseComponent {
    private router?: Router;

    constructor(router?: Router) {
        super("div", "login-container");
        this.router = router;
        this.container.innerHTML = loginTemplate;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        const loginForm = this.container.querySelector<HTMLFormElement>("#login-form")!;
        this.addEventListenerWithCleanup(loginForm, "submit", this.handleLogin.bind(this));
    }

    private async handleLogin(e: Event) {
        e.preventDefault();
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        try {
            const authController = AuthController.getInstance();
            await authController.login({ username, password });
        } catch (error) {
            // Show error message to user
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
        // remove Eventlistener
        const loginForm = document.getElementById("login-form");
        loginForm?.removeEventListener("submit", this.handleLogin.bind(this));
    }
}
