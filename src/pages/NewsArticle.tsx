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

      // Parse the content JSON string if it exists
      if (articleData && articleData.content) {
        try {
          articleData.sections = JSON.parse(articleData.content);
          console.log("Parsed sections:", articleData.sections);
        } catch (e) {
          console.error("Error parsing article sections:", e);
          // If parsing fails, treat content as a simple string
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
    return null; // Will be redirected by useEffect
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
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/actualites" 
            className="inline-flex items-center text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux actualités
          </Link>

          <article className="space-y-8">
            <header className="text-center space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
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
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={article.image_path}
                  alt={`Image principale de l'article : ${article.title}`}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            <div className="prose prose-invert max-w-none">
              {article.sections ? (
                <div className="space-y-16">
                  {article.sections.map((section, index) => (
                    <ArticleSection 
                      key={index}
                      section={section}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{article.content}</p>
              )}
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsArticle;