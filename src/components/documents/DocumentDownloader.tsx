import { useToast } from "@/hooks/use-toast";
import type { UserDocument } from "@/types/documents";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentDownloaderProps {
  document: UserDocument;
  onDownload?: (document: UserDocument) => Promise<void>;
  userName: string;
  documentType: string;
}

export const DocumentDownloader = ({ document, onDownload, userName, documentType }: DocumentDownloaderProps) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      if (onDownload) {
        await onDownload(document);
        return;
      }

      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive"
      });
    }
  };

  const buttonLabel = `Télécharger le ${documentType.toLowerCase()} de ${userName}`;

  return (
    <Button
      variant="outline"
      className="bg-blue-600 hover:bg-blue-700 text-white border-none w-full sm:w-auto"
      onClick={handleDownload}
      aria-label={buttonLabel}
    >
      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
      Télécharger
    </Button>
  );
};