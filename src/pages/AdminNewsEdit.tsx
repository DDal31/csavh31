import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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

  const { data: article, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      console.log("Fetching article for editing:", id);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching article:", error);
        throw error;
      }

      let sections: Section[] = [];
      try {
        sections = JSON.parse(data.content);
      } catch (e) {
        console.error("Error parsing article sections:", e);
        sections = [{
          subtitle: "",
          content: data.content,
          imagePath: ""
        }];
      }

      return {
        ...data,
        sections
      };
    },
    enabled: !!id
  });

  useEffect(() => {
    const checkAuth = async () => {
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

        if (profileError) {
          console.error("Erreur lors de la vérification du profil:", profileError);
          toast({
            title: "Erreur",
            description: "Impossible de vérifier vos droits d'accès",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        if (!profile || profile.site_role !== "admin") {
          console.log("Accès refusé : l'utilisateur n'est pas admin", profile);
          toast({
            title: "Accès refusé",
            description: "Vous devez être administrateur pour modifier des articles",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async ({ title, mainImage, sections }: {
    title: string;
    mainImage: File | null;
    sections: Section[];
  }) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier un article",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imagePath = article?.image_path;

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

      const { error: updateError } = await supabase
        .from('news')
        .update({
          title,
          content: JSON.stringify(sections),
          image_path: imagePath,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "L'article a été modifié avec succès",
      });

      navigate('/admin/settings/news');
    } catch (error) {
      console.error("Error updating article:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'article",
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

  if (isLoading || !article) {
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
            onPreview={handlePreview}
            isSubmitting={isSubmitting}
            onBack={() => navigate('/admin/settings/news')}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}