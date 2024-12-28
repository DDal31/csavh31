export type ClubRole = "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
export type SiteRole = "member" | "admin";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  club_role: ClubRole;
  sport: string;
  team: string;
  site_role: SiteRole;
  created_at: string;
  updated_at: string;
}