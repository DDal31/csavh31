import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentDownloader } from "@/components/documents/DocumentDownloader";
import type { UserWithDocuments, DocumentType } from "@/types/documents";

interface UserDocumentCardProps {
  user: UserWithDocuments;
  uploading: { userId: string; type: DocumentType } | null;
  onUpload: (userId: string, type: DocumentType, file: File) => Promise<void>;
  onDownload: (document: any) => Promise<void>;
  onDelete?: (document: any) => Promise<void>;
}

export function UserDocumentCard({ user, uploading, onUpload, onDownload, onDelete }: UserDocumentCardProps) {
  console.log("UserDocumentCard: Rendering for user:", user.email);

  const handleUpload = async (type: DocumentType, file: File) => {
    console.log("UserDocumentCard: Upload requested for type:", type, "file:", file.name);
    await onUpload(user.id, type, file);
  };

  const getDocumentByType = (type: DocumentType) => {
    console.log("UserDocumentCard: Getting document of type:", type, "for user:", user.email);
    return user.documents.find(doc => doc.document_type === type);
  };

  const getRequiredDocuments = (): DocumentType[] => {
    const role = user.profile.club_role;
    if (role === 'joueur' || role === 'joueur-entraineur') {
      return ['ophthalmological_certificate', 'medical_certificate', 'ffh_license', 'id_card'];
    }
    return ['ffh_license', 'id_card'];
  };

  const getDocumentLabel = (type: DocumentType): string => {
    switch (type) {
      case 'medical_certificate':
        return 'Certificat médical';
      case 'ophthalmological_certificate':
        return 'Certificat ophtalmologique';
      case 'ffh_license':
        return 'Licence FFH';
      case 'id_card':
        return 'Carte d\'identité';
      default:
        return type;
    }
  };

  const documentTypes = getRequiredDocuments();

  return (
    <Card className="bg-gray-800 border-gray-700 mb-6">
      <CardHeader>
        <CardTitle className="text-white text-xl md:text-2xl">
          {user.profile.first_name} {user.profile.last_name}
          <span className="block text-sm text-gray-400 mt-1">{user.email}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {documentTypes.map((type) => {
            const document = getDocumentByType(type);
            const documentLabel = getDocumentLabel(type);
            
            return (
              <div key={type} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="text-white mb-3 md:mb-0">
                  {documentLabel}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {document && (
                    <DocumentDownloader
                      document={document}
                      onDownload={onDownload}
                      onDelete={onDelete}
                      userName={`${user.profile.first_name} ${user.profile.last_name}`}
                      documentType={documentLabel}
                    />
                  )}
                  <DocumentUploader
                    type={type}
                    existingDocument={!!document}
                    onUploadSuccess={(file) => handleUpload(type, file)}
                    userName={`${user.profile.first_name} ${user.profile.last_name}`}
                    documentType={documentLabel}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}