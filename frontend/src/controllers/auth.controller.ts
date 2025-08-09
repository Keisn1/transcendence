import { AuthService } from "../services/auth/auth.service.ts";
import Router from "../router";
import { type LoginBody, type SignupForm, type PublicUser } from "../types/auth.types.ts";

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
        await this.authService.disable2FA(token);
    }

    public async login(credentials: { email: string; password: string }): Promise<{ requires2FA: boolean }> {
        const result = await this.authService.login(credentials);
        if (!result.requires2FA) {
            this.router.navigateTo("/");
        }

        return result;
    }

    public async complete2FALogin(token: string): Promise<void> {
        await this.authService.complete2FALogin(token);
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
        this.router.navigateTo("/profile");
    }

    public async verifyUser(userCredentials: LoginBody): Promise<PublicUser> {
        return await this.authService.verifyUser(userCredentials);
    }

    public async complete2FAVerify(token: string): Promise<PublicUser> {
        return await this.authService.complete2FAVerify(token);
    }
}
