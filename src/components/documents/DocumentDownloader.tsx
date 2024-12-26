import { useToast } from "@/hooks/use-toast";
import type { UserDocument } from "@/types/documents";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentDownloaderProps {
  document: UserDocument;
  onDownload?: (document: UserDocument) => Promise<void>;
}

export const DocumentDownloader = ({ document, onDownload }: DocumentDownloaderProps) => {
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

      // Create a temporary URL for the downloaded file
      const url = URL.createObjectURL(data);
      
      // Create a temporary link element
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      
      // Append to body, click, and cleanup
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

  return (
    <Button
      variant="outline"
      className="bg-blue-600 hover:bg-blue-700 text-white border-none"
      onClick={handleDownload}
    >
      <Download className="h-4 w-4 mr-2" />
      Télécharger
    </Button>
  );
};
