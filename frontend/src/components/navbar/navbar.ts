import navbarTemplate from "./navbar.html?raw";
import { BaseComponent } from "../BaseComponent";
import { AuthService } from "../../services/auth/auth.service.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import type { User } from "../../types/auth.types.ts";

export class Navbar extends BaseComponent {
    private authService: AuthService;
    private authCleanup: (() => void) | null = null;

    constructor() {
        super("div", "navbar-container");
        this.authService = AuthService.getInstance();

        this.container.innerHTML = navbarTemplate;
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
        const user: User = this.authService.getCurrentUser()!;

        const profileDropdown = this.container.querySelector(".relative.ml-3"); // TODO put it into a container with a better name
        const menu = this.container.querySelector<HTMLElement>('[role="menu"]')!; // TODO put it into a container with a better name
        const authButtons = this.container.querySelector("#auth-buttons");
        const avatarImg = this.container.querySelector("#navbar-avatar") as HTMLImageElement;

        menu.classList.add("hidden");

        if (isAuthenticated && user) {
            profileDropdown?.classList.remove("hidden");
            authButtons?.classList.add("hidden");

            // Update avatar if available
            if (avatarImg && user.avatar) {
                avatarImg.src = user.avatar;
            }
        } else {
            profileDropdown?.classList.add("hidden");
            authButtons?.classList.remove("hidden");
        }
    }

    setupLinks() {
        this.container.querySelector<HTMLAnchorElement>("#link-1")!.href = "/";
        this.container.querySelector<HTMLAnchorElement>("#link-2")!.href = "/game";
        this.container.querySelector<HTMLAnchorElement>("#profile-link")!.href = "/profile";
    }

    setupEvents() {
        const button = this.container.querySelector<HTMLElement>("#user-menu-button");
        const menu = this.container.querySelector<HTMLElement>('[role="menu"]');

        if (button && menu) {
            const toggleMenu = () => menu.classList.toggle("hidden");
            this.addEventListenerWithCleanup(button, "click", toggleMenu);
        }

        // Setup logout handler
        const logoutLink = this.container.querySelector<HTMLElement>("#logout-link");

        if (logoutLink) {
            const handleLogout = (e: Event) => {
                e.preventDefault();
                const authController = AuthController.getInstance();
                authController.logout();
            };
            this.addEventListenerWithCleanup(logoutLink, "click", handleLogout);
        }
    }

    destroy() {
        super.destroy(); // This handles the event listener cleanups

        if (this.authCleanup) {
            this.authCleanup();
        }
    }
}
