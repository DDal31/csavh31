export type ClubRole = "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
export type SportType = "goalball" | "torball" | "both";
export type TeamType = "loisir" | "d1_masculine" | "d1_feminine";
export type SiteRole = "member" | "admin";

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  club_role: ClubRole;
  sport: SportType;
  team: TeamType;
  site_role: SiteRole;
  created_at: string;
  updated_at: string;
}