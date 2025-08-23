import { BaseComponent } from "../BaseComponent";
import { AuthService } from "../../services/auth/auth.service";
import avatarUploadTemplate from "./avatarUpload.html?raw";
import { AuthStorage } from "../../services/auth/auth.storage";

export class AvatarUpload extends BaseComponent {
    private authService: AuthService;
    private onAvatarChange?: (avatarUrl: string) => void;
    private editModeOnly: boolean = false;

    private fileInput!: HTMLInputElement;
    private preview!: HTMLImageElement;

    constructor(onAvatarChange?: (avatarUrl: string) => void, editModeOnly: boolean = false) {
        super("div", "avatar-upload", "flex flex-col items-center space-y-4");

        this.editModeOnly = editModeOnly;
        this.authService = AuthService.getInstance();
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
            if (this.editModeOnly) {
                const editMode = document.querySelector("#edit-mode");
                if (editMode?.classList.contains("hidden")) {
                    return; // Don't allow upload in view mode
                }
            }

            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Validate file before processing
                if (!this.validateFile(file)) {
                    this.fileInput.value = ""; // Clear the input
                    return;
                }

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

    private validateFile(file: File): boolean {
        const allowedTypes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];

        if (!allowedTypes.includes(file.type)) {
            this.showError("Please select a GIF, JPEG, or PNG image file.");
            return false;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit
            this.showError("File size must be less than 5MB.");
            return false;
        }

        return true;
    }

    private showError(message: string) {
        alert(message);
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
                    Authorization: `Bearer ${AuthStorage.getToken()}`,
                },
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();

            // // Step 2: Update profile with new avatar URL
            // await this.profileService.updateProfile({ avatar: data.url });

            // Notify parent component
            if (this.onAvatarChange) {
                this.onAvatarChange(data.url);
            }
        } catch (error) {
            console.error("Avatar upload failed:", error);
        }
    }
}
