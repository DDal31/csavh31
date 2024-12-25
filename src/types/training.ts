export type Training = {
  id: string;
  type: string;
  other_type_details?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  registrations: Array<{
    id: string;
    training_id: string;
    user_id: string;
    created_at: string;
    profiles: {
      first_name: string;
      last_name: string;
      club_role: string;
    };
  }>;
};