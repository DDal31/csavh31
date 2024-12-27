import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Eye, Plus, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@supabase/auth-helpers-react";

interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
}

export default function AdminNewsCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([{ subtitle: "", content: "", imagePath: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuth();

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      const previewUrl = URL.createObjectURL(file);
      setMainImagePreview(previewUrl);
    }
  };

  const handleSectionImageChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('club-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('club-assets')
          .getPublicUrl(filePath);

        const newSections = [...sections];
        newSections[index].imagePath = publicUrl;
        setSections(newSections);

        toast({
          title: "Image téléchargée",
          description: "L'image a été téléchargée avec succès",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Erreur",
          description: "Impossible de télécharger l'image",
          variant: "destructive",
        });
      }
    }
  };

  const addSection = () => {
    setSections([...sections, { subtitle: "", content: "", imagePath: "" }]);
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const handlePreview = () => {
    // Implementation for preview functionality
    toast({
      title: "Aperçu",
      description: "Fonctionnalité d'aperçu à venir",
    });
  };

  const handlePublish = async () => {
    if (!title || !mainImage || sections.some(s => !s.subtitle || !s.content)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload main image
      const fileExt = mainImage.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('club-assets')
        .upload(filePath, mainImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-assets')
        .getPublicUrl(filePath);

      // Create news article
      const { error: insertError } = await supabase
        .from('news')
        .insert({
          title,
          content: JSON.stringify(sections),
          image_path: publicUrl,
          author_id: user?.id,
          status: 'published'
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "L'article a été publié avec succès",
      });

      navigate('/admin/settings/news');
    } catch (error) {
      console.error("Error publishing article:", error);
      toast({
        title: "Erreur",
        description: "Impossible de publier l'article",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/settings/news')}
          className="mb-6"
          aria-label="Retour à la liste des actualités"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <h1 className="text-2xl font-bold mb-6">Créer un nouvel article</h1>

        <div className="space-y-6">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Titre de l'article
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-gray-700 border-gray-600"
                  placeholder="Entrez le titre"
                  aria-label="Titre de l'article"
                />
              </div>

              <div>
                <label htmlFor="mainImage" className="block text-sm font-medium mb-2">
                  Image principale
                </label>
                <Input
                  id="mainImage"
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="bg-gray-700 border-gray-600"
                  aria-label="Sélectionner l'image principale"
                />
                {mainImagePreview && (
                  <img
                    src={mainImagePreview}
                    alt="Aperçu de l'image principale"
                    className="mt-2 max-h-48 rounded"
                  />
                )}
              </div>
            </div>
          </Card>

          {sections.map((section, index) => (
            <Card key={index} className="p-6 bg-gray-800 border-gray-700">
              <div className="space-y-4">
                <div>
                  <label htmlFor={`subtitle-${index}`} className="block text-sm font-medium mb-2">
                    Sous-titre
                  </label>
                  <Input
                    id={`subtitle-${index}`}
                    value={section.subtitle}
                    onChange={(e) => updateSection(index, "subtitle", e.target.value)}
                    className="bg-gray-700 border-gray-600"
                    placeholder="Entrez le sous-titre"
                    aria-label={`Sous-titre de la section ${index + 1}`}
                  />
                </div>

                <div>
                  <label htmlFor={`content-${index}`} className="block text-sm font-medium mb-2">
                    Contenu
                  </label>
                  <Textarea
                    id={`content-${index}`}
                    value={section.content}
                    onChange={(e) => updateSection(index, "content", e.target.value)}
                    className="bg-gray-700 border-gray-600 min-h-[150px]"
                    placeholder="Entrez le contenu"
                    aria-label={`Contenu de la section ${index + 1}`}
                  />
                </div>

                <div>
                  <label htmlFor={`image-${index}`} className="block text-sm font-medium mb-2">
                    Image de section
                  </label>
                  <Input
                    id={`image-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSectionImageChange(index, e)}
                    className="bg-gray-700 border-gray-600"
                    aria-label={`Sélectionner l'image pour la section ${index + 1}`}
                  />
                  {section.imagePath && (
                    <img
                      src={section.imagePath}
                      alt={`Image de la section ${index + 1}`}
                      className="mt-2 max-h-48 rounded"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}

          <Button
            onClick={addSection}
            className="w-full bg-gray-700 hover:bg-gray-600"
            aria-label="Ajouter un sous-titre, une photo et du texte"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </Button>

          <div className="flex gap-4 justify-end mt-6">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600"
              aria-label="Prévisualiser l'article"
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
              aria-label="Publier l'article"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Publication..." : "Publier"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}