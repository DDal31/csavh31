import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArticleForm } from "@/components/admin/news/ArticleForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import type { ArticleFormData } from "@/types/news";

export default function AdminNewsCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour accéder à cette page",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        console.log("Checking admin role for user:", session.user.id);
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error checking profile:", profileError);
          toast({
            title: "Erreur",
            description: "Impossible de vérifier vos droits d'accès",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        if (!profile || profile.site_role !== "admin") {
          console.log("Access denied: user is not admin", profile);
          toast({
            title: "Accès refusé",
            description: "Vous devez être administrateur pour publier des articles",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking admin rights:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de vos droits",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async ({ title, mainImage, sections }: ArticleFormData) => {
    console.log("Starting article submission with:", { title, sections });
    
    const { data: { session } } = await supabase.auth.getSession();
    
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
      console.log("Uploading main image...");
      const fileExt = mainImage.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('club-assets')
        .upload(filePath, mainImage);

      if (uploadError) {
        console.error("Error uploading main image:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('club-assets')
        .getPublicUrl(filePath);

      console.log("Main image uploaded successfully, URL:", publicUrl);

      const { error: insertError } = await supabase
        .from('news')
        .insert({
          title,
          content: JSON.stringify(sections),
          image_path: publicUrl,
          author_id: session.user.id,
          status: 'published'
        });

      if (insertError) {
        console.error("Error inserting article:", insertError);
        throw insertError;
      }

      console.log("Article published successfully");
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
          <h1 className="text-2xl font-bold mb-6 text-white">Créer un nouvel article</h1>
          <ArticleForm
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