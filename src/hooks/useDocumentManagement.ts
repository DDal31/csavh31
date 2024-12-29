import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { DocumentType, UserDocument } from "@/types/documents";

export const useDocumentManagement = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState<{ userId: string; type: DocumentType } | null>(null);

  const getDocumentTypeId = async (documentType: DocumentType): Promise<string> => {
    console.log("useDocumentManagement: Fetching document type ID for:", documentType);
    const { data, error } = await supabase
      .from('document_types')
      .select('id')
      .eq('name', 
        documentType === 'medical_certificate' ? 'Certificat médical' :
        documentType === 'ophthalmological_certificate' ? 'Certificat ophtalmologique' :
        documentType === 'ffh_license' ? 'Licence FFH' :
        documentType === 'id_card' ? 'Carte d\'identité' :
        'Licence FFH'
      )
      .eq('status', 'active')
      .single();

    if (error) {
      console.error("useDocumentManagement: Error fetching document type:", error);
      throw new Error("Impossible de récupérer le type de document ou type de document inactif");
    }

    console.log("useDocumentManagement: Found document type ID:", data.id);
    return data.id;
  };

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

      const documentTypeId = await getDocumentTypeId(type);
      console.log("useDocumentManagement: Got document type ID:", documentTypeId);

      console.log("useDocumentManagement: Updating database record");
      const { error: dbError } = await supabase
        .from('user_documents')
        .upsert({
          user_id: userId,
          document_type: type,
          document_type_id: documentTypeId,
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

  const handleDownload = async (userDocument: UserDocument) => {
    try {
      console.log("useDocumentManagement: Starting download for document:", userDocument.file_path);
      const { data, error } = await supabase.storage
        .from('user-documents')
        .download(userDocument.file_path);

      if (error) {
        console.error("useDocumentManagement: Download error:", error);
        throw new Error("Impossible de télécharger le document");
      }

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = userDocument.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
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

  const handleDelete = async (userDocument: UserDocument) => {
    try {
      console.log("useDocumentManagement: Starting deletion for document:", userDocument.file_path);
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([userDocument.file_path]);

      if (storageError) {
        console.error("useDocumentManagement: Storage deletion error:", storageError);
        throw new Error("Erreur lors de la suppression du fichier");
      }

      // Delete the database record
      const { error: dbError } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', userDocument.id);

      if (dbError) {
        console.error("useDocumentManagement: Database deletion error:", dbError);
        throw new Error("Erreur lors de la suppression de l'enregistrement");
      }

      console.log("useDocumentManagement: Deletion completed successfully");
      toast({
        title: "Succès",
        description: "Le document a été supprimé avec succès",
      });
      
      return true;
    } catch (error) {
      console.error("useDocumentManagement: Error in deletion process:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    uploading,
    handleFileUpload,
    handleDownload,
    handleDelete
  };
};