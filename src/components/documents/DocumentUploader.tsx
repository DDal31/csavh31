import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, Loader2 } from "lucide-react";
import type { DocumentType } from "@/types/documents";
import { supabase } from "@/integrations/supabase/client";

interface DocumentUploaderProps {
  type: DocumentType;
  existingDocument: boolean;
  onUploadSuccess: (file: File) => void;
}

export const DocumentUploader = ({ type, existingDocument, onUploadSuccess }: DocumentUploaderProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

      onUploadSuccess(file);
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