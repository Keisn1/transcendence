import navbarTemplate from "./navbar.html?raw";
import { AuthService } from "../../services/auth/auth";

export class Navbar {
    private container: HTMLDivElement;
    private eventListenerCleanups: (() => void)[] = [];
    private authService: AuthService;
    private authCleanup: (() => void) | null = null;

    constructor() {
        this.authService = AuthService.getInstance();

        const navbarContainer = document.createElement("div");
        navbarContainer.id = "navbar-container";
        navbarContainer.innerHTML = navbarTemplate;

        this.container = navbarContainer;
        this.setupEvents();
        this.setupLinks();
        this.setupAuthListener();
        this.updateNavbarState(); // Initial state
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
        const authButtons = this.container.querySelector("#auth-buttons");

        if (isAuthenticated && user) {
            console.log("Show profile dropdown");
            // Show profile dropdown
            profileDropdown?.classList.remove("hidden");
            authButtons?.classList.add("hidden");
            // Update profile image if available
            // const profileImg = this.container.querySelector<HTMLImageElement>('img[alt=""]');
            // if (profileImg && user.avatar) {
            //     profileImg.src = user.avatar;
            // }
        } else {
            // Hide profile dropdown, show auth buttons
            console.log("showing Login and SignIn Button");
            profileDropdown?.classList.add("hidden");
            authButtons?.classList.remove("hidden");
        }
    }

    getContainer(): HTMLDivElement {
        return this.container;
    }

    setupLinks() {
        this.container.querySelector<HTMLAnchorElement>("#link-1")!.href = "/";
        this.container.querySelector<HTMLAnchorElement>("#link-2")!.href = "/game";
        this.container.querySelector<HTMLAnchorElement>("#profile-link")!.href = "/profile";
    }

    setupEvents() {
        const button = this.container.querySelector("#user-menu-button")!;
        const menu = this.container.querySelector('[role="menu"]')!;

        if (button && menu) {
            const toggleMenu = () => menu.classList.toggle("hidden");
            button.addEventListener("click", toggleMenu);
            // Store cleanup function
            this.eventListenerCleanups.push(() => {
                button.removeEventListener("click", toggleMenu);
            });
        }

        // Setup logout handler
        const logoutLink = this.container.querySelector("#logout-link");
        if (logoutLink) {
            const handleLogout = (e: Event) => {
                e.preventDefault();
                this.authService.logout();
                // Redirect to home or login page
                // window.location.href = "/";
            };

            logoutLink.addEventListener("click", handleLogout);
            this.eventListenerCleanups.push(() => {
                logoutLink.removeEventListener("click", handleLogout);
            });
        }
    }

    destroy() {
        this.eventListenerCleanups.forEach((cleanup) => cleanup());
        this.eventListenerCleanups = [];

        if (this.authCleanup) {
            this.authCleanup();
        }
    }
}
