import React, { useState } from "react";
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
    console.log("File input change detected");
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    try {
      setUploading(true);
      console.log("Starting file upload process...");
      console.log("File details:", { name: file.name, size: file.size, type: file.type });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No session found");
        toast({
          title: "Erreur d'authentification",
          description: "Vous devez être connecté pour importer un document",
          variant: "destructive"
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.user.id}/${type}/${crypto.randomUUID()}.${fileExt}`;
      console.log("Generated file path:", filePath);

      console.log("Uploading file to storage...");
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
      }

      console.log("File uploaded successfully to storage");

      console.log("Updating database record...");
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
        console.error("Database update error:", dbError);
        throw new Error(`Erreur lors de la mise à jour de la base de données: ${dbError.message}`);
      }

      console.log("Database record updated successfully");

      toast({
        title: "Succès",
        description: "Document importé avec succès"
      });

      onUploadSuccess();
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    console.log("Upload button clicked, triggering file input click");
    fileInputRef.current?.click();
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log("File input clicked", {
      disabled: uploading,
      currentTarget: e.currentTarget,
      target: e.target,
    });
  };

  return (
    <div className="inline-block">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        disabled={uploading}
        onClick={handleInputClick}
      />
      <Button
        variant="outline"
        className="bg-green-600 hover:bg-green-700 text-white border-none"
        disabled={uploading}
        type="button"
        onClick={handleButtonClick}
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
    </div>
  );
};