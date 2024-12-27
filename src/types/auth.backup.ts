export interface BaseUserData {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  club_role: "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
  sport: "goalball" | "torball" | "both";
  team: "loisir" | "d1_masculine" | "d1_feminine";
  site_role: "member" | "admin";
}

export interface CreateUserData extends BaseUserData {
  password: string;
}

export type UserFormData = BaseUserData;