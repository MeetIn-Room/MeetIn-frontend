import { Role } from './role';

// User interface matching backend model
export interface User {
    id: number;
    name: string;
    email: string;
    // Updated: role can now be a Role object or legacy string
    role: Role | string;
    roleId?: string | number;  // For API calls
    department: string;
    active: boolean;
    createdAt: string;
    roleName: string;
}

// DTO for creating a new user
export interface UserCreateDTO {
    name: string;
    email: string;
    password: string;
    department: string;
    // Updated: use roleId instead of role string for dynamic roles
    roleId: string | number;
    active: boolean;
}

// DTO for updating an existing user
export interface UserUpdateDTO {
    name: string;
    email: string;
    password?: string;  // Made optional - only update if provided
    department: string;
    // Updated: use roleId for dynamic roles
    roleId?: string | number;
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

/**
 * Helper function to get role name from User
 * Handles both new Role object format and legacy string format
 */
export function getUserRoleName(user: User | null | undefined): string {
    if (!user) return '';
    if (typeof user.role === 'string') {
        return user.role;
    }
    return user.role?.name || '';
}

/**
 * Helper function to check if user has a specific role
 */
export function userHasRole(user: User | null | undefined, roleName: string): boolean {
    return getUserRoleName(user) === roleName;
}

/**
 * Helper function to check if user is admin
 */
export function isUserAdmin(user: User | null | undefined): boolean {
    return userHasRole(user, 'ADMIN');
}
