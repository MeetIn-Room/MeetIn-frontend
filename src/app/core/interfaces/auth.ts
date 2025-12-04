export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    department: string;
    isActive: boolean;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}


