import { BaseComponent } from "../BaseComponent";
import profileTemplate from "./profile.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import type { User } from "../../types/auth.types";

export class Profile extends BaseComponent {
    private authService: AuthService;
    private user: User | null = null;

    constructor() {
        super("div", "profile-content");
        this.authService = AuthService.getInstance();
        this.user = this.authService.getCurrentUser();
        this.container.innerHTML = profileTemplate;
        this.populateUserData();
    }

    private populateUserData() {
        if (!this.user) return;

        console.log(this.user);
        const usernameEl = this.container.querySelector("#profile-username")!;
        const emailEl = this.container.querySelector("#profile-email");
        const avatarEl = this.container.querySelector("#profile-avatar");

        if (usernameEl) usernameEl.textContent = this.user.username;
        if (emailEl) emailEl.textContent = this.user.email;
        if (avatarEl && this.user.avatar) {
            (avatarEl as HTMLImageElement).src = this.user.avatar;
        }
    }

    destroy(): void {
        super.destroy();
    }
}
