import type { ProfileFormData } from "@/schemas/profileSchema";
import type { ClubRole, SportType, TeamType, SiteRole } from "@/types/profile";

// Base type for user data
export interface BaseUserData extends Omit<ProfileFormData, 'password'> {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  club_role: ClubRole;
  sport: SportType;
  team: TeamType;
  site_role: SiteRole;
}

// Type for creating new users (includes password)
export interface CreateUserData extends BaseUserData {
  password: string;
}

// Type for editing users (no password required)
export type AdminUserEditData = BaseUserData;