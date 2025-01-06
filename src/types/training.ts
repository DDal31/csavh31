export type Training = {
  id: string;
  type: "goalball" | "torball" | "other" | "showdown";
  other_type_details: string | null;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  notification_week_before: string | null;
  notification_missing_players: string | null;
  notification_day_before: string | null;
  registrations?: {
    id: string;
    user_id: string;
    created_at: string;
    profiles: {
      first_name: string;
      last_name: string;
      club_role: string;
    };
  }[];
};