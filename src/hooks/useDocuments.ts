import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { mapDocumentTypeToEnum } from "@/utils/documentTypeMapping";
import { deleteExistingDocument, uploadNewDocument, updateDocumentRecord } from "@/utils/documentOperations";
import type { DocumentType } from "@/types/documents";

export const useDocuments = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: documentTypes, isLoading: loadingTypes } = useQuery({
    queryKey: ['documentTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: userDocuments, isLoading: loadingDocuments } = useQuery({
    queryKey: ['userDocuments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*, document_types(name)')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const uploadDocument = async (file: File, documentTypeId: string, currentUserId: string) => {
    setUploading(true);
    try {
      console.log('Starting document upload process...');
      
      const documentType = documentTypes?.find(type => type.id === documentTypeId);
      if (!documentType) throw new Error('Document type not found');

      const mappedDocumentType = mapDocumentTypeToEnum(documentType.name);

      const { data: existingDocs, error: fetchError } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', currentUserId)
        .eq('document_type', mappedDocumentType)
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      if (existingDocs && existingDocs.length > 0) {
        await deleteExistingDocument(existingDocs[0]);
      }

      const filePath = await uploadNewDocument(file, currentUserId, documentTypeId);

      const documentData = {
        user_id: currentUserId,
        document_type_id: documentTypeId,
        document_type: mappedDocumentType,
        file_path: filePath,
        file_name: file.name,
        uploaded_by: currentUserId,
        status: 'active' as const
      };

      await updateDocumentRecord(
        documentData,
        existingDocs?.[0]?.id
      );

      toast({
        title: "Document téléversé",
        description: "Le document a été téléversé avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ['userDocuments', currentUserId] });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléversement du document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_documents')
        .update({ status: 'archived' as const })
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ['userDocuments'] });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du document",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    documentTypes,
    userDocuments,
    uploading,
    loadingTypes,
    loadingDocuments,
    uploadDocument,
    deleteDocument,
  };
};