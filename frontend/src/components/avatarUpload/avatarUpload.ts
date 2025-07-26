import { BaseComponent } from "../BaseComponent";
import { AuthService } from "../../services/auth/auth.service";
import { ProfileService } from "../../services/profile/profile.service";

export class AvatarUpload extends BaseComponent {
    private authService: AuthService;
    private profileService: ProfileService;
    private onAvatarChange?: (avatarUrl: string) => void;

    private fileInput!: HTMLInputElement;
    private preview!: HTMLImageElement;

    constructor(onAvatarChange?: (avatarUrl: string) => void) {
        super("div", "avatar-upload", ["flex", "flex-col", "items-center", "space-y-4"]);
        this.authService = AuthService.getInstance();
        this.profileService = ProfileService.getInstance();
        this.onAvatarChange = onAvatarChange;

        this.fileInput = this.container.querySelector("#avatar-input")!;
        this.preview = this.container.querySelector("#avatar-preview")!;
        this.render();
    }

    private render() {
        const user = this.authService.getCurrentUser();
        this.container.innerHTML = `
            <div class="relative">
                <img id="avatar-preview"
                     src="${user?.avatar || "/images/default-pfp.png"}"
                     alt="Avatar"
                     class="w-32 h-32 rounded-full object-cover border-4 border-gray-300">
                <label for="avatar-input"
                       class="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 cursor-pointer shadow-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89L8.98 4.22A2 2 0 0110.645 3.5h2.71a2 2 0 011.664.72L16.405 6.11A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </label>
            </div>
            <input type="file"
                   id="avatar-input"
                   accept="image/*"
                   class="hidden">
            <p class="text-sm text-gray-600">Click camera icon to upload new avatar</p>
        `;

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

            const response = await fetch("/api/profile/avatar", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${this.authService.getAuthToken()}`,
                },
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();

            // Step 2: Update profile with new avatar URL
            await this.profileService.updateProfile({ avatar: data.avatarUrl });

            // Notify parent component
            if (this.onAvatarChange) {
                this.onAvatarChange(data.avatarUrl);
            }
        } catch (error) {
            console.error("Avatar upload failed:", error);
            // Reset preview on error
            const user = this.authService.getCurrentUser();
            this.preview.src = user?.avatar || "/images/default-pfp.png";
        }
    }
}
