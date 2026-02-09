/**
 * Role interface matching backend RoleDTO
 * Represents a user role in the system
 */
export interface Role {
  id: string | number;
  name: string;
  description?: string;
  isSystem: boolean;
  system?: boolean
  createdAt: string;
  userCount?: number;
}

/**
 * DTO for creating a new role
 */
export interface RoleCreateDTO {
  name: string;
  description?: string;
}

/**
 * DTO for updating an existing role
 */
export interface RoleUpdateDTO {
  name: string;
  description?: string;
}

/**
 * Role with display properties for UI
 */
export interface RoleDisplay extends Role {
  color?: string;  // Tailwind color class (e.g., 'bg-red-500', 'bg-blue-500')
  selected?: boolean;
}

/**
 * Standard role names
 */
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER'
} as const;

/**
 * Role color mapping for UI consistency
 * System roles have fixed colors, custom roles cycle through available colors
 */
export const ROLE_COLORS: Record<string, string> = {
  'ADMIN': 'bg-red-500 text-white',
  'USER': 'bg-blue-500 text-white',
  'MANAGER': 'bg-green-500 text-white',
  'HR': 'bg-yellow-500 text-black',
  'EXECUTIVE': 'bg-purple-500 text-white',
  'TEAM_LEAD': 'bg-pink-500 text-white',
  'FINANCE': 'bg-orange-500 text-white',
  'IT': 'bg-cyan-500 text-white',
  'MARKETING': 'bg-indigo-500 text-white',
  'SALES': 'bg-teal-500 text-white'
};

/**
 * Get color class for a role
 * Returns predefined color for system roles, generates one for custom roles
 */
export function getRoleColor(roleName: string, system: boolean): string {
  // Check if we have a predefined color
  if (ROLE_COLORS[roleName]) {
    return ROLE_COLORS[roleName];
  }

  // For custom roles without predefined colors, use a default
  // You can extend ROLE_COLORS as needed
  return system
    ? 'bg-gray-500 text-white'  // Fallback for system roles
    : 'bg-emerald-500 text-white';  // Default for custom roles
}
