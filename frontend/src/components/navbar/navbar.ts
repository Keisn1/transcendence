import navbarTemplate from "./navbar.html?raw";
import { BaseComponent } from "../BaseComponent";
import { AuthService } from "../../services/auth/auth.service.ts";
import { AuthController } from "../../controllers/auth.controller.ts";
import type { User } from "../../types/auth.types.ts";
import { AuthStorage } from "../../services/auth/auth.storage"; // 

export class Navbar extends BaseComponent {
    private authService: AuthService;
    private authCleanup: (() => void) | null = null;
    private dashboardLink: HTMLAnchorElement;
    private gameLink: HTMLAnchorElement;
    private tournamentLink: HTMLAnchorElement;
    private tournamentDefaultLink: HTMLAnchorElement;
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
    private notificationBadge: HTMLElement | null = null;
    private notificationButton: HTMLElement | null = null;
    private notificationDropdown: HTMLElement | null = null;
    private notificationDropdownContent: HTMLElement | null = null;
    private outsideClickHandler: ((e: Event) => void) | null = null;

    constructor() {
        super("div", "navbar-container");
        this.authService = AuthService.getInstance();

        this.container.innerHTML = navbarTemplate;
        // links
        this.dashboardLink = this.container.querySelector<HTMLAnchorElement>("#dashboard-link")!;
        this.gameLink = this.container.querySelector<HTMLAnchorElement>("#game-link")!;
        this.tournamentLink = this.container.querySelector<HTMLAnchorElement>("#tournament-link")!;
        this.tournamentDefaultLink = this.container.querySelector<HTMLAnchorElement>("#tournament-default-link")!;
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
        this.notificationBadge = this.container.querySelector<HTMLElement>("#notification-badge");

        // find notification elements (after template is inserted)
        this.notificationButton = this.container.querySelector<HTMLElement>("#notification-button");
        this.notificationDropdown = this.container.querySelector<HTMLElement>("#notification-dropdown");
        this.notificationDropdownContent = this.container.querySelector<HTMLElement>("#notification-dropdown-content");

        // click handler on bell
        if (this.notificationButton) {
            this.addEventListenerWithCleanup(this.notificationButton, "click", (e: Event) => {
                e.stopPropagation(); // prevent document click handler from closing immediately
                this.toggleNotificationDropdown();
            });
        }

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

        const authButtons = this.container.querySelector("#auth-buttons");
        const avatarImg = this.container.querySelector("#navbar-avatar") as HTMLImageElement;

        this.menu.classList.add("hidden");

        this.updateNotificationBadge();

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

            // hide badge when logged out
            if (this.notificationBadge) {
                this.notificationBadge.classList.add("hidden");
                this.notificationBadge.textContent = "";
            }
        }
    }

    private async updateNotificationBadge() {
        if (!this.notificationBadge) return;

        try {
            const res = await fetch("/api/friendship/requests", {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });

            if (!res.ok) {
                this.notificationBadge.classList.add("hidden");
                this.notificationBadge.textContent = "";
                this.notificationBadge.style.display = "none";
                return;
            }

            const { requests } = await res.json();
            const count = Array.isArray(requests) ? requests.length : 0;

            if (count > 0) {
                this.notificationBadge.textContent = String(count);
                this.notificationBadge.classList.remove("hidden");
                this.notificationBadge.style.display = "";
            } else {
                this.notificationBadge.classList.add("hidden");
                this.notificationBadge.textContent = "";
                this.notificationBadge.style.display = "none";
            }
        } catch (err) {
            console.error("Failed to fetch friend requests:", err);
            this.notificationBadge.classList.add("hidden");
            this.notificationBadge.textContent = "";
            this.notificationBadge.style.display = "none";
        }
    }

    // helper to fetch friend requests (returns array or [])
    private async fetchFriendRequests(): Promise<any[]> {
        try {
            const res = await fetch("/api/friendship/requests", {
                headers: { Authorization: `Bearer ${AuthStorage.getToken()}` },
            });
            if (!res.ok) return [];
            const json = await res.json();
            return Array.isArray(json.requests) ? json.requests : [];
        } catch (err) {
            console.error("Failed fetching friend requests:", err);
            return [];
        }
    }

    private async toggleNotificationDropdown() {
        if (!this.notificationDropdown || !this.notificationDropdownContent) return;

        const isHidden = this.notificationDropdown.classList.contains("hidden");
        if (!isHidden) {
            // hide
            this.notificationDropdown.classList.add("hidden");
            this.removeOutsideClickListener();
            return;
        }

        this.notificationDropdown.classList.remove("hidden");
        this.notificationDropdownContent.innerHTML = `<p class="text-sm text-gray-500 py-2">Loading...</p>`;

        const requests = await this.fetchFriendRequests();

        if (requests.length === 0) {
            this.notificationDropdownContent.innerHTML = `<p class="text-sm px-4 py-3 text-gray-500">No new requests</p>`;
        } else {
            // list of requests
            this.notificationDropdownContent.innerHTML = requests
                .map((r: any) => `
                    <div class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                    <img src="${r.avatar}" alt="${r.username}" class="w-10 h-10 rounded-full flex-shrink-0" />
                    <div class="min-w-0">
                        <a href="/user/${encodeURIComponent(r.username)}" data-link class="block text-sm font-medium text-gray-900 truncate" target="_blank" rel="noopener noreferrer">${r.username}</a>
                        <p class="text-xs text-gray-500">sent you a friend request</p>
                    </div>
                    <div class="ml-auto flex items-center gap-2">
                        <span class="text-xs text-gray-400">${r.time ? r.time : ''}</span>
                    </div>
                    </div>
                `).join("");
        }

        this.addOutsideClickListener();
    }

    private addOutsideClickListener() {
        if (this.outsideClickHandler) return; // already added
        this.outsideClickHandler = (e: Event) => {
            // if click happens outside of the dropdown and the bell, close it
            const target = e.target as Node;
            if (!this.notificationDropdown) return;
            if (this.notificationDropdown.contains(target)) return;
            if (this.notificationButton && this.notificationButton.contains(target)) return;
            this.notificationDropdown.classList.add("hidden");
            this.removeOutsideClickListener();
        };
        document.addEventListener("click", this.outsideClickHandler);
    }

    private removeOutsideClickListener() {
        if (!this.outsideClickHandler) return;
        document.removeEventListener("click", this.outsideClickHandler);
        this.outsideClickHandler = null;
    }

    setupLinks() {
        this.dashboardLink.href = "/";
        this.gameLink.href = "/game";
        this.tournamentLink.href = "/tournament";
        this.tournamentDefaultLink.href = "/tournament-default";
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
        super.destroy(); // existing cleanup

        if (this.authCleanup) {
            this.authCleanup();
        }
        // remove global click handler if set
        this.removeOutsideClickListener();
    }
}
