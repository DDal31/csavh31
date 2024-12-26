import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, Loader2 } from "lucide-react";
import type { DocumentType } from "@/types/documents";

interface DocumentUploaderProps {
  type: DocumentType;
  existingDocument: boolean;
  onUploadSuccess: (file: File) => void;
  userName: string;
  documentType: string;
}

export const DocumentUploader = ({ type, existingDocument, onUploadSuccess, userName, documentType }: DocumentUploaderProps) => {
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

      await onUploadSuccess(file);
      
      toast({
        title: "Succès",
        description: "Document importé avec succès",
      });
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Erreur lors de l'import",
        description: "Impossible d'importer le document. Veuillez réessayer.",
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

  const buttonLabel = userName ? 
    `${existingDocument ? 'Changer' : 'Importer'} le ${documentType.toLowerCase()} de ${userName}` :
    `${existingDocument ? 'Changer' : 'Importer'} le ${documentType.toLowerCase()}`;

  return (
    <div className="inline-block">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        disabled={uploading}
        aria-label={buttonLabel}
      />
      <Button
        variant="outline"
        className="bg-green-600 hover:bg-green-700 text-white border-none w-full sm:w-auto"
        disabled={uploading}
        type="button"
        onClick={handleButtonClick}
        aria-label={buttonLabel}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
        ) : existingDocument ? (
          <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
        ) : (
          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
        )}
        {existingDocument ? "Changer" : "Importer"}
      </Button>
    </div>
  );
};