import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ImageUpload } from "@/components/admin/news/ImageUpload";

export const PresentationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: presentationData, isLoading } = useQuery({
    queryKey: ["presentation-content"],
    queryFn: async () => {
      console.log("Fetching presentation content...");
      const { data, error } = await supabase
        .from("pages_content")
        .select("content, title, image_paths")
        .eq("section", "presentation")
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching presentation content:", error);
        throw error;
      }
      
      if (data) {
        setTitle(data.title || "");
        setContent(data.content || "");
        setImagePreviews(data.image_paths || []);
      }
      
      return data;
    },
  });

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    const newPreviews = [...imagePreviews];
    newPreviews[index] = previewUrl;
    setImagePreviews(newPreviews);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `presentation/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('presentation-images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('presentation-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload new images
      const uploadPromises = images
        .filter(Boolean)
        .map(file => uploadImage(file));
      
      const newImageUrls = await Promise.all(uploadPromises);
      
      // Combine existing image paths (that weren't replaced) with new ones
      const finalImagePaths = imagePreviews.map((preview, index) => 
        images[index] ? newImageUrls[images.findIndex((_, i) => i === index)] : preview
      );

      const { error } = await supabase
        .from("pages_content")
        .upsert({
          section: "presentation",
          title,
          content,
          image_paths: finalImagePaths,
        }, {
          onConflict: "section"
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La présentation a été mise à jour avec succès.",
      });
    } catch (error) {
      console.error("Error updating presentation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de la présentation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button
        onClick={() => navigate("/admin/settings")}
        variant="ghost"
        className="mb-6 text-white hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux paramètres
      </Button>
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          Modifier la présentation
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-200">
                Titre
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Titre de la présentation"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Images
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <ImageUpload
                    key={index}
                    label={`Image ${index + 1}`}
                    onChange={(file) => handleImageChange(file, index)}
                    preview={imagePreviews[index]}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-gray-200">
                Contenu
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] bg-gray-700 border-gray-600 text-white"
                placeholder="Contenu de la présentation..."
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};