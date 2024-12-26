import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentType, UserDocument } from "@/types/documents";

export const useDocumentManagement = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<{ userId: string; type: DocumentType } | null>(null);

  const handleFileUpload = async (userId: string, type: DocumentType, file: File) => {
    try {
      console.log("Starting file upload for user:", userId, "type:", type);
      setUploading({ userId, type });

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${type}/${crypto.randomUUID()}.${fileExt}`;

      console.log("Uploading file to storage path:", filePath);
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      console.log("Updating database record");
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
        console.error("Database update error:", dbError);
        throw dbError;
      }

      console.log("Upload completed successfully");
      toast({
        title: "Succès",
        description: "Document importé avec succès"
      });

      return true;
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le document",
        variant: "destructive"
      });
      return false;
    } finally {
      setUploading(null);
    }
  };

  const handleDownload = async (document: UserDocument) => {
    try {
      console.log("Starting download for document:", document.file_path);
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(document.file_path);

      if (error) {
        console.error("Download error:", error);
        throw error;
      }

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log("Download completed successfully");
    } catch (error) {
      console.error("Error in download process:", error);
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