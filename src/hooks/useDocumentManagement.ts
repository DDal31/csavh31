import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentType, UserDocument } from "@/types/documents";

export const useDocumentManagement = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<{ userId: string; type: DocumentType } | null>(null);

  const handleFileUpload = async (userId: string, type: DocumentType, file: File) => {
    try {
      console.log("useDocumentManagement: Starting file upload for user:", userId, "type:", type);
      setUploading({ userId, type });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${type}/${crypto.randomUUID()}.${fileExt}`;

      console.log("useDocumentManagement: Uploading file to storage path:", filePath);
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error("useDocumentManagement: Storage upload error:", uploadError);
        throw new Error("Erreur lors de l'upload du fichier");
      }

      console.log("useDocumentManagement: Updating database record");
      const { error: dbError } = await supabase
        .from('user_documents')
        .upsert({
          user_id: userId,
          document_type: type,
          file_path: filePath,
          file_name: file.name,
          uploaded_by: session.user.id
        }, {
          onConflict: 'user_id,document_type'
        });

      if (dbError) {
        console.error("useDocumentManagement: Database update error:", dbError);
        throw new Error("Erreur lors de la mise à jour de la base de données");
      }

      console.log("useDocumentManagement: Upload completed successfully");
      return true;
    } catch (error) {
      console.error("useDocumentManagement: Error in upload process:", error);
      throw error;
    } finally {
      setUploading(null);
    }
  };

  const handleDownload = async (document: UserDocument) => {
    try {
      console.log("useDocumentManagement: Starting download for document:", document.file_path);
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(document.file_path);

      if (error) {
        console.error("useDocumentManagement: Download error:", error);
        throw new Error("Impossible de télécharger le document");
      }

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log("useDocumentManagement: Download completed successfully");
    } catch (error) {
      console.error("useDocumentManagement: Error in download process:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive"
      });
    }
  };

  return {
    uploading,
    handleFileUpload,
    handleDownload
  };
};