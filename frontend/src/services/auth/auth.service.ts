// import { TwoFactorSetup } from "../../components/twoFactorSetup/twoFactorSetup";
import type {
    User,
    LoginResponse,
    LoginBody,
    SignupForm,
    RegisterBody,
    RegisterResponse,
    Complete2FaResponse,
} from "../../types/auth.types";
import { AuthStorage } from "./auth.storage";

export interface VerifyUserResponse {
    user: User;
    verificationToken: string;
}

export class AuthService {
    private pendingLoginData: { token: string; user: User } | null = null;
    private pendingVerifyData: { token: string; user: User } | null = null;
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

    async login(credentials: LoginBody): Promise<{ requires2FA: boolean }> {
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

        if (user.twoFaEnabled) {
            // Store login data temporarily
            this.pendingLoginData = { token: data.token, user };
            return { requires2FA: true };
        } else {
            // Complete login immediately
            this.currentUser = user;
            AuthStorage.saveUser(user);
            AuthStorage.saveToken(data.token);
            this.notifyListeners();
            return { requires2FA: false };
        }
    }

    async complete2FALogin(token: string): Promise<void> {
        if (!this.pendingLoginData) {
            throw new Error("No pending login session");
        }

        const response = await fetch("/api/auth/2fa/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.pendingLoginData.token}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Invalid 2FA code");
        }

        // Complete login
        this.currentUser = this.pendingLoginData.user;
        AuthStorage.saveUser(this.pendingLoginData.user);
        AuthStorage.saveToken(this.pendingLoginData.token);
        this.pendingLoginData = null;
        this.notifyListeners();
    }

    clearPendingLogin(): void {
        this.pendingLoginData = null;
    }

    clearPendingVerify(): void {
        this.pendingVerifyData = null;
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

    async disable2FA(token: string): Promise<void> {
        const response = await fetch("/api/auth/2fa/disable", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to disable 2FA");
        }

        // Update current user state
        const user = this.getCurrentUser();
        if (user) {
            user.twoFaEnabled = false;
            this.updateCurrentUser(user);
        }
    }

    async verify2FA(token: string): Promise<void> {
        const response = await fetch("/api/auth/2fa/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Invalid 2FA code");
        }
    }

    async initiate2FA(): Promise<string> {
        const response = await fetch("/api/auth/2fa/init", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = "Unknown error";
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorJson.message || "Unknown error";
            } catch (e) {
                errorMessage = errorText || `HTTP ${response.status}`;
            }
            throw new Error(errorMessage);
        }

        const { qrCodeSvg } = await response.json();
        return qrCodeSvg;
    }

    async complete2FA(token: string): Promise<void> {
        const response = await fetch("/api/auth/2fa/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Invalid 2FA code");
        }

        const data: Complete2FaResponse = await response.json();
        const user: User = data.user;

        // Complete login immediately
        this.currentUser = user;
        AuthStorage.saveUser(user);
        AuthStorage.saveToken(data.token);
        return;
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

    async verifyUser(credentials: LoginBody): Promise<VerifyUserResponse> {
        console.log("verifying user");
        const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error("Verification failed");
        }

        const data: LoginResponse = await response.json();
        const user: User = data.user;

        console.log("user: ", user);
        if (user.twoFaEnabled) {
            console.log("setting pending verifyData");
            this.pendingVerifyData = { token: data.token, user };
            return { user, verificationToken: "" }; // Token comes after 2FA
        } else {
            return { user, verificationToken: data.token };
        }
    }

    async complete2FAVerify(token: string): Promise<VerifyUserResponse> {
        console.log("completing 2fa");
        if (!this.pendingVerifyData) {
            throw new Error("No pending verification session");
        }

        const response = await fetch("/api/auth/2fa/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.pendingVerifyData.token}`,
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Invalid 2FA code");
        }

        const user = this.pendingVerifyData.user;
        const verificationToken = this.pendingVerifyData.token; // Use the existing token as verification
        this.pendingVerifyData = null;

        return { user, verificationToken };
    }

    async getVerificationToken(userId: string): Promise<string> {
        const response = await fetch("/api/auth/verification-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${AuthStorage.getToken()}`,
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error("Failed to get verification token");
        }

        const { token } = await response.json();
        return token;
    }
}
