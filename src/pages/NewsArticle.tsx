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

interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
}

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_path: string | null;
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
  } | null;
  sections?: Section[];
}

const NewsArticle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Redirect if no valid ID is provided
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

      // Parse the content JSON string if it exists
      if (data && data.content) {
        try {
          data.sections = JSON.parse(data.content);
        } catch (e) {
          console.error("Error parsing article sections:", e);
          // If parsing fails, treat content as a simple string
          data.sections = [{
            subtitle: "",
            content: data.content,
            imagePath: ""
          }];
        }
      }

      console.log("Fetched news article:", data);
      return data as NewsArticle;
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
                    <section 
                      key={index}
                      className={`flex flex-col lg:flex-row gap-8 items-center ${
                        index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                      }`}
                    >
                      {section.imagePath && !section.imagePath.startsWith('blob:') && (
                        <div className="lg:w-1/2">
                          <img
                            src={section.imagePath}
                            alt={`Image illustrant la section : ${section.subtitle}`}
                            className="rounded-lg object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className={`lg:w-1/2 ${!section.imagePath || section.imagePath.startsWith('blob:') ? "lg:w-full" : ""}`}>
                        {section.subtitle && (
                          <h2 className="text-2xl font-bold mb-4">{section.subtitle}</h2>
                        )}
                        <div className="prose prose-invert">
                          {section.content.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </section>
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