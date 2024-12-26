import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentDownloader } from "@/components/documents/DocumentDownloader";
import type { UserWithDocuments, DocumentType } from "@/types/documents";

interface UserDocumentCardProps {
  user: UserWithDocuments;
  uploading: { userId: string; type: DocumentType } | null;
  onUpload: (userId: string, type: DocumentType, file: File) => Promise<void>;
  onDownload: (document: any) => Promise<void>;
}

export function UserDocumentCard({ user, uploading, onUpload, onDownload }: UserDocumentCardProps) {
  console.log("UserDocumentCard: Rendering for user:", user.email);

  const handleUpload = async (type: DocumentType, file: File) => {
    console.log("UserDocumentCard: Upload requested for type:", type, "file:", file.name);
    await onUpload(user.id, type, file);
  };

  const getDocumentByType = (type: DocumentType) => {
    console.log("UserDocumentCard: Getting document of type:", type, "for user:", user.email);
    return user.documents.find(doc => doc.document_type === type);
  };

  const documentTypes: DocumentType[] = ['medical_certificate', 'license', 'id_card', 'photo'];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          {user.profile.first_name} {user.profile.last_name} ({user.email})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((type) => {
            const document = getDocumentByType(type);
            console.log("UserDocumentCard: Document status for", type, ":", document ? "exists" : "missing");
            
            return (
              <div key={type} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="text-white capitalize">
                  {type.replace('_', ' ')}
                </div>
                <div className="flex gap-2">
                  {document && (
                    <DocumentDownloader
                      document={document}
                      onDownload={onDownload}
                    />
                  )}
                  <DocumentUploader
                    type={type}
                    existingDocument={!!document}
                    onUploadSuccess={(file) => handleUpload(type, file)}
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