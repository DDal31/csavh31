import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, Loader2 } from "lucide-react";
import type { DocumentType } from "@/types/documents";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploaderProps {
  type: DocumentType;
  existingDocument: boolean;
  onUploadSuccess: () => void;
}

export const DocumentUploader = ({ type, existingDocument, onUploadSuccess }: DocumentUploaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      console.log("Starting file upload for type:", type);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour importer un document",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${type}/${crypto.randomUUID()}.${fileExt}`;

      console.log("Uploading file to path:", filePath);

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully, updating database...");

      const { error: dbError } = await supabase
        .from('user_documents')
        .upsert({
          user_id: session.user.id,
          document_type: type,
          file_path: filePath,
          file_name: file.name,
          uploaded_by: session.user.id
        }, {
          onConflict: 'user_id,document_type'
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("Database updated successfully");

      toast({
        title: "Succès",
        description: "Document importé avec succès"
      });

      onUploadSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the input value to allow uploading the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="inline-block">
      <label className="cursor-pointer">
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <Button
          variant="outline"
          className="bg-green-600 hover:bg-green-700 text-white border-none"
          disabled={uploading}
          type="button"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : existingDocument ? (
            <RefreshCw className="h-4 w-4 mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {existingDocument ? "Changer" : "Importer"}
        </Button>
      </label>
    </div>
  );
};