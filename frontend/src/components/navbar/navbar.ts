import navbarTemplate from "./navbar.html?raw";
import { BaseComponent } from "../BaseComponent";
import { AuthService } from "../../services/auth/auth.service.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import type { PublicUser } from "../../types/auth.types.ts";

export class Navbar extends BaseComponent {
    private authService: AuthService;
    private authCleanup: (() => void) | null = null;
    private dashboardLink: HTMLAnchorElement;
    private gameLink: HTMLAnchorElement;
    private tournamentLink: HTMLAnchorElement;
    private profileLink: HTMLAnchorElement;
    private profileDropdown: HTMLElement;
    private menu: HTMLElement;
    private userMenuButton: HTMLElement;
    private loginLink: HTMLAnchorElement;
    private signupLink: HTMLAnchorElement;
    private logoutLink: HTMLElement;
    private settingsLink: HTMLAnchorElement;
    private mobileDashboardLink: HTMLAnchorElement;
    private mobileGameLink: HTMLAnchorElement;
    private mobileTournamentLink: HTMLAnchorElement;

    constructor() {
        super("div", "navbar-container");
        this.authService = AuthService.getInstance();

        this.container.innerHTML = navbarTemplate;
        // links
        this.dashboardLink = this.container.querySelector<HTMLAnchorElement>("#dashboard-link")!;
        this.gameLink = this.container.querySelector<HTMLAnchorElement>("#game-link")!;
        this.tournamentLink = this.container.querySelector<HTMLAnchorElement>("#tournament-link")!;
        this.profileLink = this.container.querySelector<HTMLAnchorElement>("#profile-link")!;
        this.loginLink = this.container.querySelector<HTMLAnchorElement>("#login-link")!;
        this.signupLink = this.container.querySelector<HTMLAnchorElement>("#signup-link")!;

        this.mobileDashboardLink = this.container.querySelector<HTMLAnchorElement>("#mobile-dashboard-link")!;
        this.mobileGameLink = this.container.querySelector<HTMLAnchorElement>("#mobile-game-link")!;
        this.mobileTournamentLink = this.container.querySelector<HTMLAnchorElement>("#mobile-tournament-link")!;

        // drowdown
        this.profileDropdown = this.container.querySelector<HTMLAnchorElement>("#profile-dropdown-container")!;
        this.menu = this.container.querySelector<HTMLElement>("#menu-container")!;
        this.userMenuButton = this.container.querySelector<HTMLElement>("#user-menu-button")!;
        this.logoutLink = this.container.querySelector<HTMLElement>("#logout-link")!;
        this.settingsLink = this.container.querySelector<HTMLAnchorElement>("#settings-link")!;

        this.setupEvents();
        this.setupLinks();
        this.setupAuthListener();
        this.updateNavbarState();
    }

    private setupAuthListener() {
        // Listen for auth state changes
        this.authCleanup = this.authService.onAuthChange(() => {
            this.updateNavbarState();
        });
    }

    updateNavbarState() {
        console.log("updating navbar");
        const isAuthenticated = this.authService.isAuthenticated();
        const user: PublicUser = this.authService.getCurrentUser()!;

        const authButtons = this.container.querySelector("#auth-buttons");
        const avatarImg = this.container.querySelector("#navbar-avatar") as HTMLImageElement;

        this.menu.classList.add("hidden");

        if (isAuthenticated && user) {
            this.profileDropdown.classList.remove("hidden");
            authButtons?.classList.add("hidden");

            // Update avatar if available
            if (avatarImg && user.avatar) {
                avatarImg.src = user.avatar;
            }
        } else {
            this.profileDropdown.classList.add("hidden");
            authButtons?.classList.remove("hidden");
        }
    }

    setupLinks() {
        this.dashboardLink.href = "/";
        this.gameLink.href = "/game";
        this.tournamentLink.href = "/tournament";
        this.profileLink.href = "/profile";
        this.settingsLink.href = "/settings";
        this.loginLink.href = "/login";
        this.signupLink.href = "/signup";

        this.mobileDashboardLink.href = "/";
        this.mobileGameLink.href = "/game";
        this.mobileTournamentLink.href = "/tournament";
    }

    setupEvents() {
        const toggleMenu = () => this.menu.classList.toggle("hidden");
        this.addEventListenerWithCleanup(this.userMenuButton, "click", toggleMenu);

        const handleLogout = (e: Event) => {
            e.preventDefault();
            const authController = AuthController.getInstance();
            authController.logout();
        };
        this.addEventListenerWithCleanup(this.logoutLink, "click", handleLogout);
    }

    destroy() {
        super.destroy(); // This handles the event listener cleanups

        if (this.authCleanup) {
            this.authCleanup();
        }
    }
}
