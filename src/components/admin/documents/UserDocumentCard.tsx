import { Button } from "@/components/ui/button";
import { Download, Upload, RefreshCw, Loader2 } from "lucide-react";
import type { UserWithDocuments, DocumentType } from "@/types/documents";
import { DOCUMENT_LABELS } from "@/types/documents";

interface UserDocumentCardProps {
  user: UserWithDocuments;
  uploading: { userId: string; type: DocumentType } | null;
  onDownload: (document: any) => void;
  onUpload: (userId: string, type: DocumentType, file: File) => void;
}

export const UserDocumentCard = ({ user, uploading, onDownload, onUpload }: UserDocumentCardProps) => {
  const needsOnlyLicense = (user: UserWithDocuments) => {
    const role = user.profile.club_role;
    return ['arbitre', 'entraineur', 'joueur-arbitre', 'entraineur-arbitre'].includes(role);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    console.log("File input change detected", { type });
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", { name: file.name, type: file.type, size: file.size });
      onUpload(user.id, type, file);
    } else {
      console.log("No file selected");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">
          {user.profile.first_name} {user.profile.last_name}
        </h2>
        <p className="text-gray-400">
          {user.profile.club_role} - {user.profile.sport}
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(DOCUMENT_LABELS).map(([type, label]) => {
          if (needsOnlyLicense(user) && type !== 'ffh_license') return null;
          
          const document = user.documents.find(doc => doc.document_type === type);
          return (
            <div 
              key={type}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-700 rounded-lg"
            >
              <div>
                <h3 className="text-lg font-medium text-white">{label}</h3>
                {document && (
                  <p className="text-gray-400 text-sm">
                    Importé le {new Date(document.uploaded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {document ? (
                  <>
                    <Button
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                      onClick={() => {
                        console.log("Download clicked for document:", document);
                        onDownload(document);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, type as DocumentType)}
                        disabled={!!uploading}
                        onClick={() => console.log("File input clicked for change")}
                      />
                      <Button
                        variant="outline"
                        className="bg-green-600 hover:bg-green-700 text-white border-none"
                        disabled={!!uploading}
                      >
                        {uploading?.userId === user.id && uploading?.type === type ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Changer
                      </Button>
                    </label>
                  </>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, type as DocumentType)}
                      disabled={!!uploading}
                      onClick={() => console.log("File input clicked for upload")}
                    />
                    <Button
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 text-white border-none"
                      disabled={!!uploading}
                    >
                      {uploading?.userId === user.id && uploading?.type === type ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Importer
                    </Button>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};