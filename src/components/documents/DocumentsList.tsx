import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentDownloader } from "@/components/documents/DocumentDownloader";
import type { UserDocument, RequiredDocumentType } from "@/types/documents";
import { REQUIRED_DOCUMENT_LABELS } from "@/types/documents";

interface DocumentsListProps {
  documents: UserDocument[];
  userProfile: {
    first_name: string;
    last_name: string;
    id: string;
    club_role: string;
  } | null;
  activeDocumentTypes: any[] | undefined;
  onUpload: (type: RequiredDocumentType, file: File) => Promise<void>;
  onDownload: (document: UserDocument) => Promise<void>;
  onDelete: (document: UserDocument) => Promise<void>;
}

export const DocumentsList = ({
  documents,
  userProfile,
  activeDocumentTypes,
  onUpload,
  onDownload,
  onDelete
}: DocumentsListProps) => {
  const getRequiredDocuments = (): RequiredDocumentType[] => {
    if (!userProfile) return [];
    if (userProfile.club_role === 'joueur' || userProfile.club_role === 'joueur-entraineur') {
      return ['ophthalmological_certificate', 'medical_certificate', 'ffh_license', 'id_card'];
    }
    return ['ffh_license', 'id_card'];
  };

  // Filter required documents based on active types
  const filteredDocumentTypes = getRequiredDocuments().filter(type => {
    return activeDocumentTypes?.some(docType => 
      docType.status === 'active' && 
      docType.name === REQUIRED_DOCUMENT_LABELS[type]
    );
  });

  return (
    <div className="grid gap-6">
      {filteredDocumentTypes.map((type) => {
        const document = documents.find(doc => doc.document_type === type);
        const documentLabel = REQUIRED_DOCUMENT_LABELS[type];
        const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : '';
        
        return (
          <div 
            key={type}
            className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">{documentLabel}</h2>
              {document && (
                <p className="text-gray-400 text-sm">
                  Importé le {new Date(document.uploaded_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {document && (
                <DocumentDownloader
                  document={document}
                  onDownload={onDownload}
                  onDelete={onDelete}
                  userName={userName}
                  documentType={documentLabel}
                />
              )}
              <DocumentUploader
                type={type}
                existingDocument={!!document}
                onUploadSuccess={(file) => onUpload(type, file)}
                userName={userName}
                documentType={documentLabel}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};