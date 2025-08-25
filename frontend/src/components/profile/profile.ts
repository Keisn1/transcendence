import { BaseComponent } from "../BaseComponent";
import profileTemplate from "./profile.html?raw";
import type { Profile } from "../../types/auth.types";
import { AvatarUpload } from "../avatarUpload/avatarUpload";
import { AuthStorage } from "../../services/auth/auth.storage";
import { ProfileService } from "../../services/profile/profile.service";
import { ProfileStatsComponent } from "../profileStats/profileStats";
import { sanitizeVisibleInput, validateEmail, validateUsername } from "../../utils/validation";

export class ProfileComponent extends BaseComponent {
    private profile: Profile | null = null;
    private avatarUpload: AvatarUpload | null = null;
    private pendingAvatarUrl: string | null = null; // Store pending avatar changes
    private profileStats: ProfileStatsComponent | null = null;

    // View mode elements
    private usernameEl: HTMLElement;
    private emailEl: HTMLElement;
    private editBtn: HTMLButtonElement;

    // Edit mode elements
    private viewMode: HTMLElement;
    private editMode: HTMLElement;
    private profileForm: HTMLFormElement;
    private editUsernameInput: HTMLInputElement;
    private editEmailInput: HTMLInputElement;
    private cancelBtn: HTMLButtonElement;
    private profileService: ProfileService;
    private avatarContainer: HTMLElement;

    constructor() {
        super("div", "profile-content");
        this.container.innerHTML = profileTemplate;

        // View mode elements
        this.usernameEl = this.container.querySelector("#profile-username")!;
        this.emailEl = this.container.querySelector("#profile-email")!;
        this.editBtn = this.container.querySelector("#edit-profile-btn")!;

        // Edit mode elements
        this.viewMode = this.container.querySelector("#view-mode")!;
        this.editMode = this.container.querySelector("#edit-mode")!;
        this.profileForm = this.container.querySelector("#profile-form")!;
        this.editUsernameInput = this.container.querySelector("#edit-username")!;
        this.editEmailInput = this.container.querySelector("#edit-email")!;
        this.cancelBtn = this.container.querySelector("#cancel-edit-btn")!;

        this.avatarContainer = this.container.querySelector("#avatar-container")!;
        this.profileService = ProfileService.getInstance();

        this.setupEventListeners();
        this.setupAvatarUpload();
        this.loadProfile();

        // add stats to profile
        this.profileStats = new ProfileStatsComponent();
        this.container.appendChild(this.profileStats.getContainer());
    }

    private setupEventListeners() {
        this.addEventListenerWithCleanup(this.editBtn, "click", () => this.enterEditMode());
        this.addEventListenerWithCleanup(this.cancelBtn, "click", () => this.exitEditMode());
        this.addEventListenerWithCleanup(this.profileForm, "submit", (e) => this.handleSave(e));
    }

    private enterEditMode() {
        if (!this.profile) return;

        this.editUsernameInput.value = this.profile.username;
        this.editEmailInput.value = this.profile.email;

        this.viewMode.classList.add("hidden");
        this.editMode.classList.remove("hidden");

        // Show camera icon in edit mode
        const cameraIcon = this.avatarUpload?.getContainer().querySelector('label[for="avatar-input"]');
        if (cameraIcon) {
            (cameraIcon as HTMLElement).style.display = "block";
        }
    }

    private exitEditMode() {
        this.viewMode.classList.remove("hidden");
        this.editMode.classList.add("hidden");
        this.pendingAvatarUrl = null; // Reset pending avatar

        // Hide camera icon in view mode
        const cameraIcon = this.avatarUpload?.getContainer().querySelector('label[for="avatar-input"]');
        if (cameraIcon) {
            (cameraIcon as HTMLElement).style.display = "none";
        }

        // Reset avatar display if there was a pending change
        if (this.profile && this.avatarUpload) {
            const avatarPreview = this.avatarUpload.getContainer().querySelector("#avatar-preview") as HTMLImageElement;
            if (avatarPreview) {
                avatarPreview.src = this.profile.avatar; // Reset to original avatar
            }
        }
    }

    private async handleSave(e: Event) {
        e.preventDefault();
        if (!this.profile) return;

        const updatedData: any = {};
        const errors: string[] = [];

        // Sanitize inputs
        const sanitizedUsername = sanitizeVisibleInput(this.editUsernameInput.value);
        const sanitizedEmail = sanitizeVisibleInput(this.editEmailInput.value);

        // Validate and collect changes
        if (sanitizedUsername !== this.profile.username) {
            errors.push(...validateUsername(sanitizedUsername));
            if (errors.length === 0) {
                updatedData.username = sanitizedUsername;
            }
        }

        if (sanitizedEmail !== this.profile.email) {
            errors.push(...validateEmail(sanitizedEmail));
            if (errors.length === 0) {
                updatedData.email = sanitizedEmail;
            }
        }

        if (this.pendingAvatarUrl && this.pendingAvatarUrl !== this.profile.avatar) {
            updatedData.avatar = this.pendingAvatarUrl;
        }

        // Show validation errors if any
        if (errors.length > 0) {
            this.showErrors(errors);
            return;
        }

        if (Object.keys(updatedData).length === 0) {
            this.exitEditMode();
            return;
        }

        try {
            await this.profileService.updateProfile(updatedData);
            await this.loadProfile();
            this.exitEditMode();
            this.pendingAvatarUrl = null;
            this.clearErrors();
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    }

    private async loadProfile() {
        try {
            const response = await fetch("/api/profile", {
                headers: {
                    Authorization: `Bearer ${AuthStorage.getToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch profile");
            }

            const data = await response.json();
            this.profile = data.profile;
            this.populateUserData();
        } catch (error) {
            console.error("Error loading profile:", error);
            // Handle error - maybe show error message in UI
        }
    }

    private populateUserData() {
        if (!this.profile) return;
        if (this.usernameEl) this.usernameEl.textContent = this.profile.username;
        if (this.emailEl) this.emailEl.textContent = this.profile.email;
    }

    private setupAvatarUpload() {
        this.avatarUpload = new AvatarUpload((avatarUrl: string) => {
            this.pendingAvatarUrl = avatarUrl;
        }, true);

        this.avatarContainer.appendChild(this.avatarUpload.getContainer());

        // Hide camera icon initially (view mode)
        const cameraIcon = this.avatarUpload.getContainer().querySelector('label[for="avatar-input"]');
        if (cameraIcon) {
            (cameraIcon as HTMLElement).style.display = "none";
        }
    }

    // Add error handling methods:
    private showErrors(messages: string[]) {
        this.clearErrors();

        const errorDiv = document.createElement("div");
        errorDiv.className = "error-message text-red-600 text-sm mt-2";

        const ul = document.createElement("ul");
        ul.className = "space-y-1";
        for (const msg of messages) {
            const li = document.createElement("li");
            li.textContent = msg;
            ul.appendChild(li);
        }
        errorDiv.appendChild(ul);

        this.profileForm.insertAdjacentElement("afterend", errorDiv);
    }

    private clearErrors() {
        const existingError = this.container.querySelector(".error-message");
        existingError?.remove();
    }

    destroy(): void {
        this.avatarUpload?.destroy();
        this.profileStats?.destroy();
        super.destroy();
    }
}
