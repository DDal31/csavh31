export interface Sport {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  sport_id: string;
  created_at: string;
  updated_at: string;
}