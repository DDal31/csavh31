import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArticleForm } from "@/components/admin/news/ArticleForm";

interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
}

export default function AdminNewsCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();

  const handleSubmit = async ({ title, mainImage, sections }: {
    title: string;
    mainImage: File | null;
    sections: Section[];
  }) => {
    if (!session?.user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour publier un article",
        variant: "destructive",
      });
      return;
    }

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
      const fileExt = mainImage.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('club-assets')
        .upload(filePath, mainImage);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-assets')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('news')
        .insert({
          title,
          content: JSON.stringify(sections),
          image_path: publicUrl,
          author_id: session.user.id,
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

  const handlePreview = () => {
    toast({
      title: "Aperçu",
      description: "Fonctionnalité d'aperçu à venir",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold mb-6">Créer un nouvel article</h1>
        <ArticleForm
          onSubmit={handleSubmit}
          onPreview={handlePreview}
          isSubmitting={isSubmitting}
          onBack={() => navigate('/admin/settings/news')}
        />
      </div>
    </div>
  );
}