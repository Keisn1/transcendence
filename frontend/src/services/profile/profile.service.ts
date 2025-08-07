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
        console.log(data);
        console.log("data from PUT /api/user", data);

        // Notify AuthService to update cached user
        AuthService.getInstance().updateCurrentUser(data.user);
    }
}
