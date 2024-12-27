import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_path: string | null;
  published_at: string;
  author: {
    first_name: string;
    last_name: string;
  } | null;
}

const Actualites = () => {
  const navigate = useNavigate();
  
  const { data: news, isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      console.log("Fetching news...");
      const { data, error } = await supabase
        .from("news")
        .select(`
          *,
          author:profiles(first_name, last_name)
        `)
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

  const handleCardClick = (id: string) => {
    navigate(`/actualites/${id}`);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news?.map((item) => (
              <div key={item.id} onClick={() => handleCardClick(item.id)}>
                <BlogCard
                  id={item.id}
                  title={item.title}
                  excerpt={item.content.substring(0, 150) + "..."}
                  image={item.image_path || "/placeholder.svg"}
                  author={item.author ? `${item.author.first_name} ${item.author.last_name}` : "CSAVH31"}
                  date={format(new Date(item.published_at), "d MMMM yyyy", { locale: fr })}
                  categories={["Actualité"]}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Actualites;