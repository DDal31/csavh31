import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArticleForm } from "@/components/admin/news/ArticleForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import type { Section } from "@/types/news";

export default function AdminNewsEdit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndFetchArticle = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour accéder à cette page",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        console.log("Vérification du rôle admin pour l'utilisateur:", session.user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile || profile.site_role !== "admin") {
          console.error("Erreur lors de la vérification du profil:", profileError);
          toast({
            title: "Accès refusé",
            description: "Vous devez être administrateur pour modifier des articles",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        // Fetch article data
        const { data: articleData, error: articleError } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (articleError || !articleData) {
          console.error("Erreur lors de la récupération de l'article:", articleError);
          toast({
            title: "Erreur",
            description: "Impossible de récupérer l'article",
            variant: "destructive",
          });
          navigate("/admin/settings/news");
          return;
        }

        // Parse sections from content
        let parsedSections: Section[] = [];
        try {
          parsedSections = JSON.parse(articleData.content);
        } catch (error) {
          console.error("Erreur lors du parsing des sections:", error);
          parsedSections = [{
            subtitle: "",
            content: articleData.content,
            imagePath: ""
          }];
        }

        setArticle({
          ...articleData,
          sections: parsedSections
        });
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    checkAuthAndFetchArticle();
  }, [id, navigate, toast]);

  const handleSubmit = async ({ title, mainImage, sections }: {
    title: string;
    mainImage: File | null;
    sections: Section[];
  }) => {
    setIsSubmitting(true);

    try {
      let imagePath = article.image_path;

      // Upload new main image if provided
      if (mainImage) {
        const fileExt = mainImage.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('club-assets')
          .upload(filePath, mainImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('club-assets')
          .getPublicUrl(filePath);

        imagePath = publicUrl;
      }

      // Process sections to upload new images
      const processedSections = await Promise.all(
        sections.map(async (section) => {
          const processedSection = { ...section };
          if (section.imageFile) {
            try {
              const fileExt = section.imageFile.name.split('.').pop();
              const filePath = `${crypto.randomUUID()}.${fileExt}`;
              
              const { error: uploadError } = await supabase.storage
                .from('club-assets')
                .upload(filePath, section.imageFile);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('club-assets')
                .getPublicUrl(filePath);

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

      const { error: updateError } = await supabase
        .from('news')
        .update({
          title,
          content: JSON.stringify(processedSections),
          image_path: imagePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "L'article a été mis à jour avec succès",
      });

      navigate('/admin/settings/news');
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold mb-6 text-white">Modifier l'article</h1>
          <ArticleForm
            initialData={{
              title: article.title,
              mainImageUrl: article.image_path,
              sections: article.sections
            }}
            onSubmit={handleSubmit}
            onPreview={() => {
              toast({
                title: "Aperçu",
                description: "Fonctionnalité d'aperçu à venir",
              });
            }}
            isSubmitting={isSubmitting}
            onBack={() => navigate('/admin/settings/news')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}