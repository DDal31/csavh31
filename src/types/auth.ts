import type { ProfileFormData } from "@/schemas/profileSchema";

// Base type for user data
export interface BaseUserData extends Omit<ProfileFormData, 'password'> {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  club_role: string;
  sport: string;
  team: string;
  site_role: string;
}

// Type for creating new users (includes password)
export interface CreateUserData extends BaseUserData {
  password: string;
}

// Type for editing users (no password required)
export type AdminUserEditData = BaseUserData;