import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentType } from "@/types/documents";

export const useDocuments = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  // Fetch document types
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

  // Fetch user documents
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

  const mapDocumentTypeToEnum = (name: string): DocumentType => {
    const normalizedName = name.toLowerCase().replace(/ /g, '_');
    switch (normalizedName) {
      case 'certificat_medical':
        return 'medical_certificate';
      case 'certificat_ophtalmologique':
        return 'ophthalmological_certificate';
      case 'licence_ffh':
        return 'ffh_license';
      case 'licence':
        return 'license';
      case 'carte_identite':
        return 'id_card';
      case 'photo':
        return 'photo';
      default:
        throw new Error(`Invalid document type: ${name}`);
    }
  };

  // Upload document
  const uploadDocument = async (file: File, documentTypeId: string, currentUserId: string) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${currentUserId}/${documentTypeId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the document type from documentTypes
      const documentType = documentTypes?.find(type => type.id === documentTypeId);
      if (!documentType) throw new Error('Document type not found');

      const mappedDocumentType = mapDocumentTypeToEnum(documentType.name);

      const { error: dbError } = await supabase
        .from('user_documents')
        .insert({
          user_id: currentUserId,
          document_type_id: documentTypeId,
          document_type: mappedDocumentType,
          file_path: filePath,
          file_name: file.name,
          uploaded_by: currentUserId,
          status: 'active'
        });

      if (dbError) throw dbError;

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
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Update document status in database
      const { error: dbError } = await supabase
        .from('user_documents')
        .update({ status: 'archived' })
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