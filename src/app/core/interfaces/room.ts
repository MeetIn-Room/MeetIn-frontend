import { Role } from "./role";

export interface Room {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  type?: string;
  openTime: string;
  closeTime: string;
  amenities?: string[];
  description?: string;
  isActive: boolean;
  active?: boolean;
  allowedRoleNames: string[]

  // NEW FIELDS for role-based access control:
  allowedRoles?: string[];  // Role names allowed to book this room (empty = all roles)
  allowedRoleIds?: (string | number)[];  // For API communication
}

/**
 * DTO for creating a room
 */
export interface RoomCreateDTO {
  name: string;
  location: string;
  capacity: number;
  type?: string;
  openTime: string;
  closeTime: string;
  amenities?: string[];
  description: string;
  isActive?: boolean;
  // NEW: Role restrictions
  allowedRoleIds?: (string | number)[];
}

/**
 * DTO for updating a room
 */
export interface RoomUpdateDTO {
  name?: string;
  location?: string;
  capacity?: number;
  type?: string;
  openTime?: string;
  closeTime?: string;
  amenities?: string[];
  description?: string;
  isActive?: boolean;
  // NEW: Role restrictions
  allowedRoleIds?: (string | number)[];
}

/**
 * Check if a room has role-based restrictions
 */
export function hasRoleRestrictions(room: Room | null | undefined): boolean {
  if (!room) return false;
  return room.allowedRoles !== undefined && room.allowedRoles.length > 0;
}

/**
 * Check if a user with given role can book a room
 * @param room The room to check
 * @param userRoleName The user's role name
 * @param isAdmin Whether the user is an admin (admins can override restrictions)
 */
export function canRoleBookRoom(
  room: Room | null | undefined, 
  userRoleName: string | null | undefined,
  isAdmin: boolean = false
): boolean {
  if (!room) return false;
  
  // Admins can book any room
  if (isAdmin) return true;
  
  // No restrictions = any role can book
  if (!hasRoleRestrictions(room)) return true;
  
  // Check if user's role is in allowed roles
  if (!userRoleName) return false;
  return room.allowedRoles?.includes(userRoleName) || false;
}

/**
 * Get a display string for room restrictions
 */
export function getRoomRestrictionText(room: Room | null | undefined): string {
  if (!hasRoleRestrictions(room)) {
    return 'Open to all roles';
  }
  
  const roles = room?.allowedRoles || [];
  if (roles.length === 1) {
    return `Restricted to: ${roles[0]}`;
  }
  if (roles.length <= 3) {
    return `Restricted to: ${roles.join(', ')}`;
  }
  return `Restricted to: ${roles.slice(0, 3).join(', ')} +${roles.length - 3} more`;
}
