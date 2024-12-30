import { supabase } from "@/integrations/supabase/client";
import type { DocumentType } from "@/types/documents";

export const deleteExistingDocument = async (existingDoc: { file_path: string }) => {
  console.log('Deleting old file from storage...');
  const { error: deleteStorageError } = await supabase.storage
    .from('user-documents')
    .remove([existingDoc.file_path]);

  if (deleteStorageError) {
    console.error('Error deleting old file:', deleteStorageError);
  }
};

export const uploadNewDocument = async (
  file: File,
  userId: string,
  documentTypeId: string
) => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${documentTypeId}/${crypto.randomUUID()}.${fileExt}`;

  console.log('Uploading new file to storage...');
  const { error: uploadError } = await supabase.storage
    .from('user-documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  return filePath;
};

export const updateDocumentRecord = async (
  documentData: {
    user_id: string;
    document_type_id: string;
    document_type: DocumentType;
    file_path: string;
    file_name: string;
    uploaded_by: string;
    status: 'active' | 'archived';
  },
  existingDocId?: string
) => {
  if (existingDocId) {
    console.log('Updating existing document record...');
    const { error: updateError } = await supabase
      .from('user_documents')
      .update(documentData)
      .eq('id', existingDocId);

    if (updateError) throw updateError;
  } else {
    console.log('Inserting new document record...');
    const { error: insertError } = await supabase
      .from('user_documents')
      .insert([documentData]);

    if (insertError) throw insertError;
  }
};