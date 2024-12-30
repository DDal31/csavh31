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
  }
) => {
  // First check if a document of this type already exists for the user
  console.log('Checking for existing document...');
  const { data: existingDoc, error: fetchError } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', documentData.user_id)
    .eq('document_type', documentData.document_type)
    .eq('status', 'active')
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existingDoc) {
    console.log('Updating existing document record...');
    const { error: updateError } = await supabase
      .from('user_documents')
      .update({
        file_path: documentData.file_path,
        file_name: documentData.file_name,
        uploaded_by: documentData.uploaded_by,
        document_type_id: documentData.document_type_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingDoc.id);

    if (updateError) throw updateError;
  } else {
    console.log('Inserting new document record...');
    const { error: insertError } = await supabase
      .from('user_documents')
      .insert([documentData]);

    if (insertError) throw insertError;
  }
};