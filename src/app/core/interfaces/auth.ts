export interface User {
    id: string;
    name: string;
    email: string;
    role?: 'admin' | 'user';

}

export interface AuthResponse {
    user: User;
    accesstoken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}


