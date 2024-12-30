import { Button } from "@/components/ui/button";
import { Upload, Trash2, Download } from "lucide-react";
import type { UserWithDocuments } from "@/types/documents";

type Props = {
  users: UserWithDocuments[];
  documentTypes: any[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, typeId: string, userId: string) => void;
  onDelete: (documentId: string, filePath: string) => void;
  onDownload: (document: { file_path: string; file_name: string }, userName: string, documentName: string) => void;
  uploading: boolean;
  selectedTeam: string | null;
};

export function UserDocumentsList({ 
  users, 
  documentTypes, 
  onUpload, 
  onDelete, 
  onDownload,
  uploading,
  selectedTeam 
}: Props) {
  const filteredUsers = selectedTeam 
    ? users.filter(user => user.profile.team === selectedTeam)
    : users;

  return (
    <div className="space-y-8">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-gray-800 rounded-lg p-6"
          role="region"
          aria-label={`Documents de ${user.profile.first_name} ${user.profile.last_name}`}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            {user.profile.first_name} {user.profile.last_name}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentTypes?.map((type) => {
              const userDoc = user.documents?.find(
                (doc) => doc.document_type_id === type.id
              );

              return (
                <div
                  key={type.id}
                  className="bg-gray-700 rounded-lg p-4 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {type.name}
                    </h3>
                    {userDoc && (
                      <p className="text-sm text-gray-300 mb-4">
                        Fichier actuel : {userDoc.file_name}
                      </p>
                    )}
                  </div>

                  {!userDoc ? (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${type.id}-${user.id}`}
                        className="hidden"
                        onChange={(e) => onUpload(e, type.id, user.id)}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <label
                        htmlFor={`file-${type.id}-${user.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-full justify-center"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importer
                      </label>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => onDelete(userDoc.id, userDoc.file_path)}
                        disabled={uploading}
                        className="flex-1"
                        aria-label={`Supprimer ${type.name} de ${user.profile.first_name} ${user.profile.last_name}`}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => onDownload(
                          userDoc,
                          `${user.profile.last_name}_${user.profile.first_name}`,
                          type.name.toLowerCase().replace(/ /g, '_')
                        )}
                        className="flex-1"
                        aria-label={`Télécharger ${type.name} de ${user.profile.first_name} ${user.profile.last_name}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}