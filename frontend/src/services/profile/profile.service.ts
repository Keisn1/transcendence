import { AuthService } from "../auth/auth.service";
import type { UpdateUserBody, UpdateUserResponse } from "../../types/auth.types";
import { AuthStorage } from "../auth/auth.storage";

export class ProfileService {
    private static instance: ProfileService;

    private constructor() {}

    static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    async updateProfile(updates: UpdateUserBody): Promise<void> {
        const response = await fetch("/api/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) throw new Error("Profile update failed");

        const data: UpdateUserResponse = await response.json();

        // Notify AuthService to update cached user
        AuthService.getInstance().updateCurrentUser(data.user);
    }

    async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
        const response = await fetch("/api/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify({
                currentPassword,
                password: newPassword,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || "Password update failed");
        }
    }
}
