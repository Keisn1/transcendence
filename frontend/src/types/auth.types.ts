export interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    token: string;
    user: User;
}

export interface UpdateProfileBody {
    username?: string;
    email?: string;
    avatar?: File | string; // File for upload, string for URL
}

export interface UpdateProfileResponse {
    user: User;
}

export interface SignupForm {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string; // for frontend validation
}
