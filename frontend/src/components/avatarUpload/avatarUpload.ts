import { BaseComponent } from "../BaseComponent";
import { AuthService } from "../../services/auth/auth.service";
import { ProfileService } from "../../services/profile/profile.service";
import avatarUploadTemplate from "./avatarUpload.html?raw";

export class AvatarUpload extends BaseComponent {
    private authService: AuthService;
    private profileService: ProfileService;
    private onAvatarChange?: (avatarUrl: string) => void;

    private fileInput!: HTMLInputElement;
    private preview!: HTMLImageElement;

    constructor(onAvatarChange?: (avatarUrl: string) => void) {
        super("div", "avatar-upload", "flex flex-col items-center space-y-4");

        this.authService = AuthService.getInstance();
        this.profileService = ProfileService.getInstance();
        this.onAvatarChange = onAvatarChange;

        this.container.innerHTML = avatarUploadTemplate;

        this.fileInput = this.container.querySelector("#avatar-input")!;
        this.preview = this.container.querySelector("#avatar-preview")!;

        const user = this.authService.getCurrentUser()!;
        this.preview.src = user.avatar;

        this.setupEvents();
    }

    private setupEvents() {
        this.addEventListenerWithCleanup(this.fileInput, "change", (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Preview immediately
                const reader = new FileReader();
                reader.onload = (e) => {
                    const avatarUrl = e.target?.result as string;
                    this.preview.src = avatarUrl;

                    // Simulate upload and update user
                    this.uploadAvatar(file);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    private async uploadAvatar(file: File) {
        try {
            // Step 1: Upload file to get avatar URL
            const formData = new FormData();
            formData.append("avatar", file);

            console.log("we are uploading");
            const response = await fetch("/api/file/upload/avatar", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${this.authService.getAuthToken()}`,
                },
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();

            // Step 2: Update profile with new avatar URL
            await this.profileService.updateProfile({ avatar: data.url });

            // Notify parent component
            if (this.onAvatarChange) {
                this.onAvatarChange(data.url);
            }
        } catch (error) {
            console.error("Avatar upload failed:", error);
        }
    }
}
