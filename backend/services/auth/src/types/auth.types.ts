export interface PublicUser {
    id: string;
    username: string;
    avatar: string;
}

export interface User {
    id: string;
    username: string;
    avatar: string;
    twoFaEnabled: boolean;
}

export interface Profile {
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

export interface VerifyResponse {
    user: User;
}

export interface VerifyBody {
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

export interface UpdateUserBody {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
}

export interface UpdateUserResponse {
    user: User;
}

export interface complete2FABody {
    token: string;
}

export interface Complete2FaResponse {
    token: string;
    user: User;
}
