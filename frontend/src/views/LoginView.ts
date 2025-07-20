import AbstractView from "./AbstractView.ts";
import { AuthService } from "../services/auth/auth.ts";
import loginTemplate from "./login.html?raw";

export default class extends AbstractView {
    private authService: AuthService;

    constructor() {
        super();
        this.setTitle("Login");
        this.authService = AuthService.getInstance();
    }

    render() {
        document.body.innerHTML = loginTemplate;
        this.setupEventListeners();
    }

    private setupEventListeners() {
        const loginForm = document.getElementById("login-form");
        loginForm?.addEventListener("submit", this.handleLogin.bind(this));
    }

    private handleLogin(e: Event) {
        e.preventDefault();
        const username = (document.getElementById("username") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        console.log(password);

        // Here you would normally call an API
        // For now, simulate login success
        this.authService.login({
            id: "123",
            username: username,
            email: `${username}@example.com`,
            avatar: "https://example.com/avatar.jpg",
        });

        // Redirect to dashboard
        history.pushState(null, "", "/");
        window.dispatchEvent(new PopStateEvent("popstate"));
    }

    destroy() {
        const loginForm = document.getElementById("login-form");
        loginForm?.removeEventListener("submit", this.handleLogin.bind(this));
        document.getElementById("everything")?.remove();
    }
}
