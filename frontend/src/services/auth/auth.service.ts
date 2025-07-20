import { type User, type LoginResponse, type LoginBody } from "../../types/auth.types";

export class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;
    private listeners: ((user: User | null) => void)[] = [];

    private constructor() {
        // Check if user is already logged in (from localStorage/sessionStorage)
        this.loadUserFromStorage();
    }

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    isAuthenticated(): boolean {
        return this.currentUser !== null;
    }

    async login(credentials: LoginBody): Promise<void> {
        const response = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error("Login failed");
        }

        const data: LoginResponse = await response.json();
        const user: User = data.user;
        this.currentUser = user;
        this.saveUserToStorage(user);
        this.saveTokenToStorage(data.token);
        this.notifyListeners();
    }

    logout(): void {
        console.log("logging out");
        this.currentUser = null;
        this.clearUserFromStorage();
        this.clearTokenFromStorage();
        this.notifyListeners();
    }

    private saveTokenToStorage(token: string): void {
        localStorage.setItem("authToken", token);
    }

    private clearTokenFromStorage(): void {
        localStorage.removeItem("authToken");
    }

    getAuthToken(): string | null {
        return localStorage.getItem("authToken");
    }

    // methods that control User Data in localStorage
    private saveUserToStorage(user: User): void {
        localStorage.setItem("user", JSON.stringify(user));
    }

    private loadUserFromStorage(): void {
        const userData = localStorage.getItem("user");
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    private clearUserFromStorage(): void {
        localStorage.removeItem("user");
    }

    // setup listeners and notifications
    // register a callback to this.listeners
    // returns a cleanup function that can be called to remove the callback from the listener
    onAuthChange(callback: (user: User | null) => void): () => void {
        this.listeners.push(callback);
        // Return cleanup function
        return () => {
            this.listeners = this.listeners.filter((listener) => listener !== callback);
        };
    }

    private notifyListeners(): void {
        console.log("notifying listeners about login or logout");
        this.listeners.forEach((listener) => listener(this.currentUser));
    }
}
