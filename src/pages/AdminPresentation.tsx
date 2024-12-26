import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";

const AdminPresentation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    const checkAuthAndLoadContent = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          console.log("Accès non autorisé : l'utilisateur n'est pas admin");
          navigate("/dashboard");
          return;
        }

        const { data: presentationData } = await supabase
          .from("pages_content")
          .select("title, content, image_paths")
          .eq("section", "presentation")
          .maybeSingle();

        if (presentationData) {
          setTitle(presentationData.title || "");
          setContent(presentationData.content || "");
          setImages(presentationData.image_paths || []);
        } else {
          setTitle("Présentation");
          setContent("Contenu de présentation par défaut");
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données de présentation",
          variant: "destructive"
        });
        navigate("/dashboard");
      }
    };

    checkAuthAndLoadContent();
  }, [navigate, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + previewImages.length > 3) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez pas ajouter plus de 3 images",
        variant: "destructive",
      });
      return;
    }

    const newPreviewImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const newImagePaths = [...images];

      // Upload new images
      for (const preview of previewImages) {
        const fileExt = preview.file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('presentation-images')
          .upload(filePath, preview.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('presentation-images')
          .getPublicUrl(filePath);

        newImagePaths.push(publicUrl);
      }

      // Upsert content in database using the unique constraint on section
      const { error: upsertError } = await supabase
        .from('pages_content')
        .upsert(
          {
            section: 'presentation',
            title,
            content,
            image_paths: newImagePaths
          },
          {
            onConflict: 'section'
          }
        );

      if (upsertError) throw upsertError;

      setImages(newImagePaths);
      setPreviewImages([]);

      toast({
        title: "Succès",
        description: "La présentation a été mise à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Modifier la Présentation</h1>
            <button
              onClick={() => navigate("/admin/settings")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Retourner aux paramètres"
            >
              Retour
            </button>
          </div>

          <Card className="bg-gray-800 p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Titre de la présentation
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-700 text-white border-gray-600"
                placeholder="Entrez le titre"
                aria-label="Titre de la présentation"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
                Contenu de la présentation
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-gray-700 text-white border-gray-600 min-h-[200px]"
                placeholder="Entrez le contenu"
                aria-label="Contenu de la présentation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Images (maximum 3)
              </label>
              
              {/* Existing images */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Image ${index + 1} de la présentation`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Supprimer l'image"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Preview images */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview.preview}
                      alt={`Prévisualisation ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePreviewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Supprimer la prévisualisation"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {(images.length + previewImages.length) < 3 && (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">
                        Cliquez pour ajouter des images
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      aria-label="Ajouter des images"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  "Sauvegarder les modifications"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPresentation;
