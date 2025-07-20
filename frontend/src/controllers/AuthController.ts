import { AuthService } from "../services/auth/auth";
import Router from "../router";

export class AuthController {
    private static instance: AuthController;
    private authService: AuthService;
    private router: Router;
    private previousRoute: string = "/"; // Default fallback

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
        console.log(currentPath);
        this.authService.logout();

        const authRequiredPaths = ["/profile", "/account", "/settings"];

        if (authRequiredPaths.includes(currentPath)) {
            console.log("navigating to /");
            this.router.navigateTo("/");
        }
    }

    public login(userData: any): void {
        this.authService.login(userData);
        this.router.navigateTo(this.previousRoute);
    }

    public setPreviousRoute(route: string): void {
        this.previousRoute = route;
        if (route !== "/login" && route !== "/signout") {
            this.previousRoute = route;
        }
    }
}
