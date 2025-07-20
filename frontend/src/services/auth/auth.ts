// auth.ts
export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

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

    async login(credentials: { username: string; password: string }): Promise<void> {
        try {
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

            const user: User = await response.json();
            this.currentUser = user;
            this.saveUserToStorage(user);
            this.notifyListeners();
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    logout(): void {
        console.log("logging out");
        this.currentUser = null;
        this.clearUserFromStorage();
        this.notifyListeners();
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
