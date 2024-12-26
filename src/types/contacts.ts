export interface Contact {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  photo_url?: string | null;
  status?: 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'status'>;