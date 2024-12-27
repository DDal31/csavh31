import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface NewsArticle {
  id: string;
  title: string;
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
  } | null;
}

const AdminNews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
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

        fetchNews();
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchNews = async () => {
    try {
      const { data: newsData, error } = await supabase
        .from("news")
        .select(`
          id,
          title,
          published_at,
          author:profiles!news_author_id_fkey (
            first_name,
            last_name
          )
        `)
        .order("published_at", { ascending: false });

      if (error) throw error;

      const formattedNews = (newsData || []).map(item => ({
        id: item.id,
        title: item.title,
        published_at: item.published_at,
        author: item.author || {
          first_name: "Unknown",
          last_name: "Author"
        }
      }));

      setNews(formattedNews);
    } catch (error) {
      console.error("Erreur lors de la récupération des actualités:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les actualités",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'actualité a été supprimée",
      });

      fetchNews();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'actualité:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'actualité",
        variant: "destructive",
      });
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
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <Button
              onClick={() => navigate("/admin/settings")}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux Paramètres
            </Button>
            <Button
              onClick={() => navigate("/admin/settings/news/create")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Actualité
            </Button>
          </div>

          <div className="space-y-4">
            {news.map((article) => (
              <Card key={article.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {article.title}
                      </h3>
                      <div className="text-sm text-gray-400">
                        <p>
                          Publié le{" "}
                          {format(new Date(article.published_at), "d MMMM yyyy", {
                            locale: fr,
                          })}
                        </p>
                        <p>
                          Par {article.author.first_name} {article.author.last_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={() =>
                          navigate(`/admin/settings/news/${article.id}/edit`)
                        }
                        variant="outline"
                        className="flex-1 sm:flex-none"
                        aria-label={`Modifier l'actualité : ${article.title}`}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        onClick={() => handleDelete(article.id)}
                        variant="destructive"
                        className="flex-1 sm:flex-none"
                        aria-label={`Supprimer l'actualité : ${article.title}`}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {news.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucune actualité n'a été publiée pour le moment.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNews;