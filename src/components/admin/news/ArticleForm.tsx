import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Eye, Plus, Send, ArrowLeft } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { ArticleSection } from "./ArticleSection";
import { supabase } from "@/integrations/supabase/client";

interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
  imageFile?: File;
}

interface ArticleFormProps {
  onSubmit: (data: {
    title: string;
    mainImage: File | null;
    sections: Section[];
  }) => Promise<void>;
  onPreview: () => void;
  isSubmitting: boolean;
  onBack: () => void;
}

export const ArticleForm = ({ onSubmit, onPreview, isSubmitting, onBack }: ArticleFormProps) => {
  const [title, setTitle] = useState("");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([{ subtitle: "", content: "", imagePath: "" }]);

  const handleMainImageChange = (file: File | null) => {
    if (file) {
      setMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  const addSection = () => {
    setSections([...sections, { subtitle: "", content: "", imagePath: "" }]);
  };

  const updateSection = (index: number, field: keyof Section, value: string | File) => {
    const newSections = [...sections];
    if (field === "imagePath" && value instanceof File) {
      // Store the file object for later upload
      newSections[index].imageFile = value;
      // Create a temporary preview URL
      newSections[index].imagePath = URL.createObjectURL(value);
    } else {
      newSections[index][field] = value as string;
    }
    setSections(newSections);
  };

  const uploadSectionImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('club-assets')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading section image:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('club-assets')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process sections to upload images and get permanent URLs
    const processedSections = await Promise.all(
      sections.map(async (section) => {
        const processedSection = { ...section };
        if (section.imageFile) {
          try {
            const publicUrl = await uploadSectionImage(section.imageFile);
            processedSection.imagePath = publicUrl;
          } catch (error) {
            console.error("Failed to upload section image:", error);
          }
        }
        // Remove the temporary imageFile property
        delete processedSection.imageFile;
        return processedSection;
      })
    );

    await onSubmit({ 
      title, 
      mainImage, 
      sections: processedSections 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="mb-6"
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

      {sections.map((section, index) => (
        <ArticleSection
          key={index}
          section={section}
          onChange={(field, value) => updateSection(index, field, value)}
          index={index}
        />
      ))}

      <Button
        type="button"
        onClick={addSection}
        className="w-full bg-gray-700 hover:bg-gray-600"
        aria-label="Ajouter un sous-titre, une photo et du texte"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une section
      </Button>

      <div className="flex gap-4 justify-end mt-6">
        <Button
          type="button"
          onClick={onPreview}
          variant="outline"
          className="bg-gray-700 hover:bg-gray-600"
          aria-label="Prévisualiser l'article"
        >
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
          aria-label="Publier l'article"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Publication..." : "Publier"}
        </Button>
      </div>
    </form>
  );
};