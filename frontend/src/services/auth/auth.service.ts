import type {
    User,
    LoginResponse,
    LoginBody,
    SignupForm,
    RegisterBody,
    RegisterResponse,
} from "../../types/auth.types";
import { AuthStorage } from "./auth.storage";

export class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;
    private listeners: ((user: User | null) => void)[] = [];

    private constructor() {
        this.currentUser = AuthStorage.loadUser();
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
        if (this.currentUser !== null && AuthStorage.getToken() === null) this.logout();
        if (this.currentUser === null && AuthStorage.getToken() !== null) this.logout();
        return this.currentUser !== null;
    }

    async login(credentials: LoginBody): Promise<void> {
        const response = await fetch("/api/auth/login", {
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
        AuthStorage.saveUser(user);
        AuthStorage.saveToken(data.token);
        this.notifyListeners();
    }

    async signUp(credentials: SignupForm): Promise<void> {
        const requestBody: RegisterBody = {
            username: credentials.username,
            email: credentials.email,
            password: credentials.password,
        };

        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error("Sign up failed");
        }

        const data: RegisterResponse = await response.json();
        const user: User = data.user;
        this.currentUser = user;
        AuthStorage.saveUser(user);
        AuthStorage.saveToken(data.token);
        this.notifyListeners();
    }

    logout(): void {
        console.log("logging out");
        this.currentUser = null;
        AuthStorage.clearUser();
        AuthStorage.clearToken();
        this.notifyListeners();
    }

    // way of consumer to subscribe to changes in the AuthService
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

    updateCurrentUser(user: User): void {
        this.currentUser = user;
        AuthStorage.saveUser(user);
        this.notifyListeners();
    }
}
