import type { Profile } from "./profile";
import type { Database } from "@/integrations/supabase/types";

export type DocumentTypeStatus = Database["public"]["Enums"]["document_type_status"];

export interface DocumentType {
  id: string;
  name: string;
  status: DocumentTypeStatus;
  created_at: string;
  updated_at: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  document_type: string; // Now using UUID instead of enum
  document_type_id: string;
  file_path: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: string;
  status: DocumentTypeStatus | null;
  document_types: DocumentType;
}

export interface UserWithDocuments {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  documents: UserDocument[];
  profile: Profile;
}