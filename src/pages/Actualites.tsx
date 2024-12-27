import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_path: string | null;
  published_at: string;
}

const placeholderImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";

const Actualites = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      console.log("Fetching news...");
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching news:", error);
        throw error;
      }
      
      console.log("Fetched news:", data);
      return data as NewsItem[];
    },
  });

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24" role="main">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Actualités
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-24" role="status" aria-label="Chargement en cours">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
            <span className="sr-only">Chargement des actualités...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news?.map((item) => (
              <Card 
                key={item.id}
                className="bg-gray-800 border-gray-700 hover:border-primary transition-colors cursor-pointer"
                onClick={() => window.location.href = `/blog/${item.id}`}
                role="article"
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img
                    src={item.image_path || placeholderImage}
                    alt={`Image illustrant l'article : ${item.title}`}
                    className="object-cover w-full h-48 rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-100">
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    Publié le {formatDate(item.published_at)}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 line-clamp-3">
                    {truncateContent(item.content)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Actualites;