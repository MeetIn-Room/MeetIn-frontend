export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    accesstoken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}


