import type { Profile } from "./profile";

export type DocumentType = 'medical_certificate' | 'ophthalmological_certificate' | 'ffh_license' | 'license' | 'id_card' | 'photo';

export type RequiredDocumentType = 'medical_certificate' | 'ophthalmological_certificate' | 'ffh_license';

export interface UserDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface UserWithDocuments {
  id: string;
  email: string;
  profile: Profile;
  documents: UserDocument[];
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  medical_certificate: 'Certificat Médical',
  ophthalmological_certificate: 'Certificat Ophtalmologique',
  ffh_license: 'Licence FFH',
  license: 'Licence',
  id_card: 'Carte d\'identité',
  photo: 'Photo'
};

export const REQUIRED_DOCUMENT_LABELS: Record<RequiredDocumentType, string> = {
  medical_certificate: 'Certificat Médical',
  ophthalmological_certificate: 'Certificat Ophtalmologique',
  ffh_license: 'Licence FFH'
};