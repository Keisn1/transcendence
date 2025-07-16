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

    login(user: User): void {
        this.currentUser = user;
        this.saveUserToStorage(user);
        this.notifyListeners();
    }

    logout(): void {
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
        this.listeners.forEach((listener) => listener(this.currentUser));
    }
}
