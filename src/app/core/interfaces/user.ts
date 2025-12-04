// User interface matching backend model
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    department: string;
    active: boolean;
    createdAt: string;
}

// DTO for creating a new user
export interface UserCreateDTO {
    name: string;
    email: string;
    password: string;
    department: string;
    role: 'ADMIN' | 'USER';
    active: boolean;
}

// DTO for updating an existing user
export interface UserUpdateDTO {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'USER';
    active?: boolean
}

// Extended user interface for frontend display with additional fields
export interface UserDisplay extends User {
    selected?: boolean;
    lastLogin?: string;
    lastLoginIp?: string;
    phone?: string;
    permissions?: string[];
}
