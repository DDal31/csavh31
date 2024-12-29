import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DocumentDownloaderProps {
  document: any;
  onDownload: (document: any) => Promise<void>;
  onDelete?: (document: any) => Promise<void>;
  userName: string;
  documentType: string;
}

export function DocumentDownloader({
  document,
  onDownload,
  onDelete,
  userName,
  documentType
}: DocumentDownloaderProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="bg-blue-600 hover:bg-blue-700 text-white border-none"
        onClick={() => onDownload(document)}
        aria-label={`Télécharger ${documentType} de ${userName}`}
      >
        <Download className="h-4 w-4 mr-2" />
        Télécharger
      </Button>

      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="hover:bg-red-700"
              aria-label={`Supprimer ${documentType} de ${userName}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-800 border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Êtes-vous sûr de vouloir supprimer {documentType} ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700 text-white border-none"
                onClick={() => onDelete(document)}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}