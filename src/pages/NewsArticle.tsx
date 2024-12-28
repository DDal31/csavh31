import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { ArticleSection } from "@/components/news/ArticleSection";
import { ArticleHeader } from "@/components/news/ArticleHeader";
import { ImageGallery } from "@/components/news/ImageGallery";
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

      return articleData;
    },
    enabled: !!id && id !== 'undefined',
  });

  const getAllImages = () => {
    if (!article) return [];
    
    const images: { url: string; title: string }[] = [];
    
    if (article.image_path) {
      images.push({
        url: article.image_path,
        title: "Image principale"
      });
    }
    
    article.sections?.forEach((section, index) => {
      if (section.imagePath && !section.imagePath.startsWith('blob:')) {
        images.push({
          url: section.imagePath,
          title: section.subtitle || `Section ${index + 1}`
        });
      }
    });
    
    return images;
  };

  if (!id || id === 'undefined') return null;

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

  const allImages = getAllImages();

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
            <span>Retour aux actualités</span>
          </Link>

          <article>
            <ArticleHeader
              title={article.title}
              imagePath={article.image_path}
              publishedAt={article.published_at}
              author={article.author}
            />

            <div className="space-y-8">
              {article.sections?.map((section, index) => (
                <ArticleSection 
                  key={index}
                  section={section}
                  index={index}
                />
              ))}
            </div>

            <ImageGallery images={allImages} />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsArticle;