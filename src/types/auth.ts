import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Base user data without password
export interface BaseUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  club_role: Profile["club_role"];
  sport: Profile["sport"];
  team: Profile["team"];
  site_role: Profile["site_role"];
}

// Type for creating new users (requires password)
export interface CreateUserData extends BaseUserData {
  password: string;
}

// Type for editing users (no password required)
export type AdminUserEditData = BaseUserData;