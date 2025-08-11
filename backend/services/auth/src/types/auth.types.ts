export interface PublicUser {
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
    twoFaEnabled: boolean;
}

export interface LoginResponse {
    token: string;
    user: PublicUser;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface VerifyResponse {
    user: PublicUser;
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
    user: PublicUser;
}

export interface UpdateUserBody {
    username?: string;
    email?: string;
    password?: string;
    avatar?: string;
}

export interface UpdateUserResponse {
    user: PublicUser;
}

export interface complete2FABody {
    token: string;
}

export interface Complete2FaResponse {
    token: string;
    user: PublicUser;
}
