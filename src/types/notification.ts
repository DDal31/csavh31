export interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  training_id?: string;
  sent_at: string;
  sent_by?: string;
  status: 'success' | 'error';
  error_message?: string | null;
}

export interface FCMToken {
  id: string;
  user_id: string;
  token: string;
  device_type?: string;
  created_at: string;
  updated_at: string;
}