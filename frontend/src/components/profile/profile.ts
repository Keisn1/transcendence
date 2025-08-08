import { BaseComponent } from "../BaseComponent";
import profileTemplate from "./profile.html?raw";
import { AuthService } from "../../services/auth/auth.service";
import type { PublicUser } from "../../types/auth.types";
import { AvatarUpload } from "../avatarUpload/avatarUpload";

export class Profile extends BaseComponent {
    private authService: AuthService;
    private user: PublicUser | null = null;
    private avatarUpload: AvatarUpload | null = null;
    private usernameEl: HTMLElement;
    // private emailEl: HTMLElement;
    private avatarContainer: HTMLElement;

    constructor() {
        super("div", "profile-content");
        this.authService = AuthService.getInstance();
        this.user = this.authService.getCurrentUser();
        this.container.innerHTML = profileTemplate;

        this.usernameEl = this.container.querySelector("#profile-username")!;
        // this.emailEl = this.container.querySelector("#profile-email")!;
        this.avatarContainer = this.container.querySelector("#avatar-container")!;

        this.setupAvatarUpload();
        this.populateUserData();
    }

    private populateUserData() {
        if (!this.user) return;

        console.log("user: ", this.user);
        if (this.usernameEl) this.usernameEl.textContent = this.user.username;
        // if (this.emailEl) this.emailEl.textContent = this.user.email;
    }

    private setupAvatarUpload() {
        this.avatarUpload = new AvatarUpload(() => {
            // Refresh user data when avatar changes
            console.log("callback on avatarUpload");
            console.log(this);
            this.user = this.authService.getCurrentUser();
            console.log("updated user: ", this.user);
            this.populateUserData();
        });

        this.avatarContainer.appendChild(this.avatarUpload.getContainer());
    }

    destroy(): void {
        this.avatarUpload?.destroy();
        super.destroy();
    }
}
