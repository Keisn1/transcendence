import { AuthService } from "../services/auth/auth.service.ts";
import Router from "../router";
import { type SignupForm } from "../types/auth.types.ts";
import { AuthStorage } from "../services/auth/auth.storage.ts";

export class AuthController {
    private static instance: AuthController;
    private authService: AuthService;
    private router: Router;

    private constructor(router: Router) {
        this.authService = AuthService.getInstance();
        this.router = router;
    }

    public static getInstance(router?: Router): AuthController {
        if (!AuthController.instance && router) {
            AuthController.instance = new AuthController(router);
        }
        return AuthController.instance;
    }

    public logout(): void {
        const currentPath = window.location.pathname;
        this.authService.logout();

        console.log("inside logout");
        console.log(currentPath);
        const authRequiredPaths = ["/profile", "/settings", "/settings/gdpr"];

        if (authRequiredPaths.includes(currentPath)) {
            console.log("navigating to /");
            this.router.navigateTo("/");
        }
    }

    public async initiate2FA(): Promise<string> {
        if (!this.authService.isAuthenticated()) {
            throw new Error("Please log in first");
        }
        return await this.authService.initiate2FA();
    }

    public async complete2FA(token: string): Promise<void> {
        await this.authService.complete2FA(token);
    }

    public async disable2FA(token: string): Promise<void> {
        const response = await fetch("/api/auth/2fa/disable", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to disable 2FA");
        }

        // Update current user state
        const user = this.authService.getCurrentUser();
        if (user) {
            user.twoFaEnabled = false;
            this.authService.updateCurrentUser(user);
        }
    }

    public async login(credentials: { email: string; password: string }): Promise<void> {
        await this.authService.login(credentials);
        this.router.navigateTo("/");
    }

    public async signUp(formData: SignupForm): Promise<void> {
        await this.authService.signUp(formData);
        this.router.navigateTo("/profile");
    }
}
