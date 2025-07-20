import { BaseComponent } from "../BaseComponent";
import profileTemplate from "./profile.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import type { User } from "../../types/auth.types";
import { AvatarUpload } from "../avatarUpload/avatarUpload";

export class Profile extends BaseComponent {
    private authService: AuthService;
    private user: User | null = null;
    private avatarUpload: AvatarUpload | null = null;

    constructor() {
        super("div", "profile-content");
        this.authService = AuthService.getInstance();
        this.user = this.authService.getCurrentUser();
        this.container.innerHTML = profileTemplate;
        this.setupAvatarUpload();
        this.populateUserData();
    }

    private populateUserData() {
        if (!this.user) return;

        const usernameEl = this.container.querySelector("#profile-username")!;
        const emailEl = this.container.querySelector("#profile-email");
        const avatarEl = this.container.querySelector("#profile-avatar");

        if (usernameEl) usernameEl.textContent = this.user.username;
        if (emailEl) emailEl.textContent = this.user.email;
        if (avatarEl && this.user.avatar) {
            (avatarEl as HTMLImageElement).src = this.user.avatar;
        }
    }

    private setupAvatarUpload() {
        this.avatarUpload = new AvatarUpload(() => {
            // Refresh user data when avatar changes
            this.user = this.authService.getCurrentUser();
            this.populateUserData();
        });

        const avatarContainer = this.container.querySelector("#avatar-container");
        if (avatarContainer) {
            avatarContainer.appendChild(this.avatarUpload.getContainer());
        }
    }

    destroy(): void {
        this.avatarUpload?.destroy();
        super.destroy();
    }
}
