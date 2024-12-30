import type { DocumentType } from "@/types/documents";

export const mapDocumentTypeToEnum = (name: string): DocumentType => {
  const normalizedName = name.toLowerCase().replace(/ /g, '_');
  const frenchToEnglishMap: Record<string, DocumentType> = {
    'certificat_medical': 'medical_certificate',
    'certificat_ophtalmologique': 'ophthalmological_certificate',
    'licence_ffh': 'ffh_license',
    'licence': 'license',
    'carte_identite': 'id_card',
    'photo': 'photo',
    // Add more mappings if needed
  };

  const mappedType = frenchToEnglishMap[normalizedName];
  
  if (!mappedType) {
    console.warn(`Unmapped document type: ${name}`);
    throw new Error(`Invalid document type: ${name}`);
  }

  return mappedType;
};