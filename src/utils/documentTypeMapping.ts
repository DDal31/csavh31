import type { DocumentType } from "@/types/documents";

export const mapDocumentTypeToEnum = (name: string): DocumentType => {
  const normalizedName = name.toLowerCase().replace(/ /g, '_');
  switch (normalizedName) {
    case 'certificat_medical':
      return 'medical_certificate';
    case 'certificat_ophtalmologique':
      return 'ophthalmological_certificate';
    case 'licence_ffh':
      return 'ffh_license';
    case 'licence':
      return 'license';
    case 'carte_identite':
      return 'id_card';
    case 'photo':
      return 'photo';
    default:
      throw new Error(`Invalid document type: ${name}`);
  }
};