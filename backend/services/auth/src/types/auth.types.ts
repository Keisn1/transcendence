export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
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
}

export interface UpdateUserResponse {
    id: number;
    username: string;
    email: string;
}
