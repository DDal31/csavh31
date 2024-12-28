import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Eye, Send, ArrowLeft } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { SectionManager } from "./form/SectionManager";
import { supabase } from "@/integrations/supabase/client";
import type { Section, ArticleFormData } from "@/types/news";

interface ArticleFormProps {
  initialData?: {
    title: string;
    mainImageUrl?: string | null;
    sections: Section[];
  };
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onPreview: () => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export const ArticleForm = ({ initialData, onSubmit, onPreview, isSubmitting, onBack }: ArticleFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>(initialData?.mainImageUrl || "");
  const [sections, setSections] = useState<Section[]>(
    initialData?.sections || [{ subtitle: "", content: "", imagePath: "" }]
  );

  const handleMainImageChange = (file: File | null) => {
    if (file) {
      setMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ 
      title, 
      mainImage, 
      mainImageUrl: mainImagePreview,
      sections 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-white hover:text-gray-300"
        aria-label="Retour à la liste des actualités"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 text-white">
              Titre de l'article
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Entrez le titre"
              aria-label="Titre de l'article"
              required
            />
          </div>

          <ImageUpload
            label="Image principale"
            onChange={handleMainImageChange}
            preview={mainImagePreview}
          />
        </div>
      </Card>

      <SectionManager sections={sections} onChange={setSections} />

      <div className="flex gap-4 justify-end mt-6">
        <Button
          type="button"
          onClick={onPreview}
          variant="outline"
          className="bg-gray-700 hover:bg-gray-600 text-white"
          aria-label="Prévisualiser l'article"
        >
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          aria-label="Enregistrer les modifications"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
};