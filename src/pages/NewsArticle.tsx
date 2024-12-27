import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { ArticleSection } from "@/components/news/ArticleSection";
import { NewsArticle as NewsArticleType } from "@/types/news";

const NewsArticle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || id === 'undefined') {
      console.log("Invalid news article ID, redirecting to news list");
      navigate('/actualites');
    }
  }, [id, navigate]);

  const { data: article, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      if (!id || id === 'undefined') {
        throw new Error("Invalid article ID");
      }

      console.log("Fetching news article:", id);
      const { data, error } = await supabase
        .from("news")
        .select(`
          *,
          author:profiles(first_name, last_name)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching news article:", error);
        throw error;
      }

      const articleData = data as NewsArticleType;

      if (articleData && articleData.content) {
        try {
          articleData.sections = JSON.parse(articleData.content);
          console.log("Parsed sections:", articleData.sections);
        } catch (e) {
          console.error("Error parsing article sections:", e);
          articleData.sections = [{
            subtitle: "",
            content: articleData.content,
            imagePath: ""
          }];
        }
      }

      console.log("Fetched news article:", articleData);
      return articleData;
    },
    enabled: !!id && id !== 'undefined',
  });

  if (!id || id === 'undefined') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <Link to="/actualites">
              <Button>Retour aux actualités</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-5xl mx-auto">
          <Link 
            to="/actualites" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux actualités
          </Link>

          <article className="bg-gray-800 rounded-lg border border-gray-700 p-8 mb-8">
            <header className="text-center space-y-6 mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-100">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-center space-x-4 text-gray-400">
                {article.author && (
                  <span>
                    Par {article.author.first_name} {article.author.last_name}
                  </span>
                )}
                <time dateTime={article.published_at}>
                  {format(new Date(article.published_at), "d MMMM yyyy", {
                    locale: fr,
                  })}
                </time>
              </div>
            </header>

            {article.image_path && (
              <div className="aspect-video relative rounded-lg overflow-hidden mb-8 shadow-lg">
                <img
                  src={article.image_path}
                  alt={`Image principale de l'article : ${article.title}`}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </article>

          <div className="space-y-8">
            {article.sections ? (
              article.sections.map((section, index) => (
                <ArticleSection 
                  key={index}
                  section={section}
                  index={index}
                />
              ))
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
                <p className="text-gray-300 whitespace-pre-wrap">{article.content}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsArticle;