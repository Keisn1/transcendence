import { BaseComponent } from "../BaseComponent";
import profileTemplate from "./profile.html?raw";
import type { Profile } from "../../types/auth.types";
import { AvatarUpload } from "../avatarUpload/avatarUpload";
import { AuthStorage } from "../../services/auth/auth.storage";

export class ProfileComponent extends BaseComponent {
    private profile: Profile | null = null;
    private avatarUpload: AvatarUpload | null = null;
    private usernameEl: HTMLElement;
    private emailEl: HTMLElement;
    private avatarContainer: HTMLElement;

    constructor() {
        super("div", "profile-content");
        this.container.innerHTML = profileTemplate;

        this.usernameEl = this.container.querySelector("#profile-username")!;
        this.emailEl = this.container.querySelector("#profile-email")!;
        this.avatarContainer = this.container.querySelector("#avatar-container")!;

        this.setupAvatarUpload();
        this.loadProfile();
    }

    private async loadProfile() {
        try {
            const response = await fetch("/api/profile", {
                headers: {
                    Authorization: `Bearer ${AuthStorage.getToken()}`,
                },
            });

            // Debug: log the raw response
            const responseText = await response.text();
            console.log("Raw response:", responseText);
            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            if (!response.ok) {
                throw new Error(`Failed to fetch profile: ${response.status}`);
            }

            const data = JSON.parse(responseText); // Manual parse for debugging
            this.profile = data.profile;
            this.populateUserData();
        } catch (error) {
            console.error("Error loading profile:", error);
            // Handle error - maybe show error message in UI
        }
    }

    private populateUserData() {
        if (!this.profile) return;

        console.log("user: ", this.profile);
        if (this.usernameEl) this.usernameEl.textContent = this.profile.username;
        if (this.emailEl) this.emailEl.textContent = this.profile.email;
    }

    private setupAvatarUpload() {
        this.avatarUpload = new AvatarUpload(() => {
            // Refresh profile data when avatar changes
            console.log("callback on avatarUpload - reloading profile");
            this.loadProfile(); // Reload from API instead of using AuthService
        });

        this.avatarContainer.appendChild(this.avatarUpload.getContainer());
    }

    destroy(): void {
        this.avatarUpload?.destroy();
        super.destroy();
    }
}
