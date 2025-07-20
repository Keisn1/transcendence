import { AuthController } from "../../controllers/AuthController";
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
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        try {
            const authController = AuthController.getInstance();
            await authController.login({ username, password });
        } catch (error) {
            // Show error message to user
            console.error("Login failed:", error);
        }
    }

    destroy(): void {
        super.destroy();
        // remove Eventlistener
        const loginForm = document.getElementById("login-form");
        loginForm?.removeEventListener("submit", this.handleLogin.bind(this));
    }
}
