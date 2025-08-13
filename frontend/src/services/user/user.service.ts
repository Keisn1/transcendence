import { AuthStorage } from "../auth/auth.storage";
import type { PublicUser } from "../../types/auth.types";

export class UserService {
    private static instance: UserService;

    private constructor() {}

    static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async getUserById(id: string): Promise<PublicUser> {
        if (!id) throw new Error("getUserById: id is required");

        const resp = await fetch(`/api/user/${encodeURIComponent(id)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
        });

        if (!resp.ok) {
            throw new Error(`Failed to fetch user ${id}: ${resp.status} ${resp.statusText}`);
        }

        const data = await resp.json();

        const user: PublicUser | undefined = data.user;

        if (!user) {
            throw new Error(`Unexpected response shape when fetching user ${id}`);
        }

        return user;
    }
}
