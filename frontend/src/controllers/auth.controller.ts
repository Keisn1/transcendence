import { AuthService } from "../services/auth/auth.service.ts";
import Router from "../router";
import { type SignupForm } from "../types/auth.types.ts";

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

    public async login(credentials: { email: string; password: string }): Promise<void> {
        await this.authService.login(credentials);
        this.router.navigateTo("/");
    }

    public async signUp(formData: SignupForm): Promise<void> {
        await this.authService.signUp(formData);
        this.router.navigateTo("/profile");
    }
}
