import navbarTemplate from "./navbar.html?raw";
import { AuthService } from "../../services/auth/auth";
import { BaseComponent } from "../BaseComponent";

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
        const user = this.authService.getCurrentUser();

        // Update profile dropdown visibility
        const profileDropdown = this.container.querySelector(".relative.ml-3");
        const menu = this.container.querySelector<HTMLElement>('[role="menu"]')!;
        const authButtons = this.container.querySelector("#auth-buttons");

        // hide the menu by default
        menu.classList.add("hidden");
        if (isAuthenticated && user) {
            // Show profile dropdown
            profileDropdown?.classList.remove("hidden");
            authButtons?.classList.add("hidden");
        } else {
            // Hide profile dropdown, show auth buttons
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
                this.authService.logout();
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
