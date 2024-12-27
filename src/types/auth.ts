import type { ClubRole, SportType, TeamType, SiteRole } from "@/types/profile";

// Base type for user data
export interface BaseUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  club_role: ClubRole;
  sport: SportType;
  team: TeamType;
  site_role: SiteRole;
}

// Type for creating new users (includes required password)
export interface CreateUserData extends BaseUserData {
  password: string;
}

// Type for editing users (no password required)
export type AdminUserEditData = BaseUserData;

// Form type that can handle both create and edit cases
export type UserFormData = CreateUserData;