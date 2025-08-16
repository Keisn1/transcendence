import { AuthService } from "../services/auth/auth.service.ts";
import Router from "../router";
import { type LoginBody, type SignupForm, type User } from "../types/auth.types.ts";
import { OnlineStatusService } from "../services/user/onlineStatus.service.ts";
import { AuthStorage } from "../services/auth/auth.storage.ts";

export class AuthController {
    private onlineStatusService: OnlineStatusService;

    private static instance: AuthController;
    private authService: AuthService;
    private router: Router;

    private constructor(router: Router) {
        this.authService = AuthService.getInstance();
        this.onlineStatusService = new OnlineStatusService();
        this.router = router;

        if (AuthStorage.getToken() && AuthStorage.loadUser()) {
            this.onlineStatusService.startTracking();
        }
    }

    public static getInstance(router?: Router): AuthController {
        if (!AuthController.instance && router) {
            AuthController.instance = new AuthController(router);
        }
        return AuthController.instance;
    }

    public logout(): void {
        const currentPath = window.location.pathname;
        this.onlineStatusService.stopTracking();
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
        await this.authService.disable2FA(token);
    }

    public async login(credentials: { email: string; password: string }): Promise<{ requires2FA: boolean }> {
        const result = await this.authService.login(credentials);
        if (!result.requires2FA) {
            this.onlineStatusService.startTracking();
            this.router.navigateTo("/");
        }

        return result;
    }

    public async complete2FALogin(token: string): Promise<void> {
        await this.authService.complete2FALogin(token);
        this.onlineStatusService.startTracking();
        this.router.navigateTo("/");
    }

    public clearPendingLogin(): void {
        this.authService.clearPendingLogin();
    }

    public clearPendingVerify(): void {
        this.authService.clearPendingVerify();
    }

    public async signUp(formData: SignupForm): Promise<void> {
        await this.authService.signUp(formData);
        this.onlineStatusService.startTracking();
        this.router.navigateTo("/profile");
    }

    public async verifyUser(userCredentials: LoginBody): Promise<User> {
        return await this.authService.verifyUser(userCredentials);
    }

    public async complete2FAVerify(token: string): Promise<User> {
        return await this.authService.complete2FAVerify(token);
    }
}
