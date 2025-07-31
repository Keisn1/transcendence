import { BaseComponent } from "../BaseComponent";
import profileTemplate from "./profile.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import type { User } from "../../types/auth.types";
import { AvatarUpload } from "../avatarUpload/avatarUpload";

export class Profile extends BaseComponent {
    private authService: AuthService;
    private user: User | null = null;
    private avatarUpload: AvatarUpload | null = null;
    private usernameEl: HTMLElement;
    private emailEl: HTMLElement;
    private avatarEl: HTMLImageElement;
    private avatarContainer: HTMLElement;

    constructor() {
        super("div", "profile-content");
        this.authService = AuthService.getInstance();
        this.user = this.authService.getCurrentUser();
        this.container.innerHTML = profileTemplate;

        this.usernameEl = this.container.querySelector("#profile-username")!;
        this.emailEl = this.container.querySelector("#profile-email")!;
        this.avatarContainer = this.container.querySelector("#avatar-container")!;
        this.avatarEl = this.container.querySelector("#profile-avatar")!;

        this.setupAvatarUpload();
        this.populateUserData();
    }

    private populateUserData() {
        if (!this.user) return;

        if (this.usernameEl) this.usernameEl.textContent = this.user.username;
        if (this.emailEl) this.emailEl.textContent = this.user.email;
        console.log(this.user.avatar);
        if (this.avatarEl && this.user.avatar) {
            console.log("setting source")(this.avatarEl as HTMLImageElement).src =
                "/api/file/uploads/" + this.user.avatar;
        }
    }

    private setupAvatarUpload() {
        this.avatarUpload = new AvatarUpload(() => {
            // Refresh user data when avatar changes
            this.user = this.authService.getCurrentUser();
            this.populateUserData();
        });

        this.avatarContainer.appendChild(this.avatarUpload.getContainer());
    }

    destroy(): void {
        this.avatarUpload?.destroy();
        super.destroy();
    }
}
