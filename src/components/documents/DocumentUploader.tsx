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

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${type}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

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

      if (dbError) throw dbError;

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
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={uploading}
      />
      <Button
        variant="outline"
        className="bg-green-600 hover:bg-green-700 text-white border-none"
        disabled={uploading}
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
  );
};