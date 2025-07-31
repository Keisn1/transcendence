import { AuthService } from "../auth/auth.service";
import type { UpdateProfileBody } from "../../types/auth.types";

export class ProfileService {
    private static instance: ProfileService;
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    async updateProfile(updates: UpdateProfileBody): Promise<void> {
        const response = await fetch("/api/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.authService.getAuthToken()}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Profile update failed");

        const data = await response.json();

        // Notify AuthService to update cached user
        this.authService.updateCurrentUser(data.user);
    }
}
