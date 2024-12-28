export type Training = {
  id: string;
  type: "goalball" | "torball" | "other" | "showdown";
  other_type_details: string | null;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  registrations: {
    id: string;
    user_id: string;
    created_at: string;
    training_id: string;
    profiles: {
      first_name: string;
      last_name: string;
      club_role: "joueur" | "entraineur" | "arbitre" | "joueur-entraineur" | "joueur-arbitre" | "entraineur-arbitre" | "les-trois";
    };
  }[];
};