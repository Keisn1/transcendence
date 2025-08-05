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

export interface complete2FAResponse {
    success: boolean;
}