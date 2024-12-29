import type { Profile } from "./profile";
import type { Database } from "@/integrations/supabase/types";

export type DocumentType = Database["public"]["Enums"]["document_type"];
export type DocumentTypeStatus = Database["public"]["Enums"]["document_type_status"];

export interface UserDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_type_id: string;
  file_path: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: string;
  status: DocumentTypeStatus | null;
  document_types?: {
    name: string;
  };
}

export interface UserWithDocuments {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  documents: UserDocument[];
  profile: Profile;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  medical_certificate: 'Certificat Médical',
  ophthalmological_certificate: 'Certificat Ophtalmologique',
  ffh_license: 'Licence FFH',
  license: 'Licence',
  id_card: 'Carte d\'identité',
  photo: 'Photo'
};