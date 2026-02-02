import { Role } from './role';

/**
 * User interface for authentication responses
 * Matches the backend User entity structure
 */
export interface User {
    id: string;
    name: string;
    email: string;
    // Role can be either a Role object (new format) or a string (legacy format)
    role: Role | string;
    roleId?: string | number;  // For API calls
    department: string;
    // Backend uses isActive, but we normalize to active in the user interface
    isActive: boolean;
    createdAt: string;
    roleName: string;
}

/**
 * Auth response from login endpoint
 */
export interface AuthResponse {
    user: User;
    token: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
    email: string;
    password: string;
}

/**
 * Helper function to get role name from auth User
 * Handles both new Role object format and legacy string format
 */
export function getAuthUserRoleName(user: User | null | undefined): string {
    if (!user) return '';
    if (typeof user.role === 'string') {
        return user.role;
    }
    return user.role?.name || '';
}
