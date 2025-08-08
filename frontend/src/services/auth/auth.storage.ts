import type { PublicUser } from "../../types/auth.types";

export class AuthStorage {
    private static readonly USER_KEY = "user";
    private static readonly TOKEN_KEY = "authToken";

    static saveUser(user: PublicUser): void {
        try {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error("Failed to save user data to localStorage:", error);
        }
    }

    static loadUser(): PublicUser | null {
        try {
            const userData = localStorage.getItem(this.USER_KEY);
            if (userData && userData !== "undefined" && userData !== "null") {
                return JSON.parse(userData);
            }
            return null;
        } catch (error) {
            console.warn("Failed to parse user data from localStorage, clearing it:", error);
            localStorage.removeItem(this.USER_KEY);
            return null;
        }
    }

    static clearUser(): void {
        localStorage.removeItem(this.USER_KEY);
    }

    static saveToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static clearToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }
}
