import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Type de base pour les données utilisateur sans mot de passe
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

// Type pour la création d'utilisateurs (nécessite un mot de passe)
export interface CreateUserData extends BaseUserData {
  password: string;
}

// Type pour l'édition d'utilisateurs (pas de mot de passe requis)
export type AdminUserEditData = BaseUserData;

// Type générique pour les formulaires
export type UserFormData = CreateUserData;