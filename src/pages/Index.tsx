import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Podcast, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import BlogCard from "@/components/BlogCard";

const Index = () => {
  const navigate = useNavigate();

  // Récupération des actualités
  const { data: news, isLoading: isLoadingNews } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      console.log("Fetching news...");
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching news:", error);
        throw error;
      }

      console.log("Fetched news:", data);
      return data;
    },
  });

  // Récupération du contenu de présentation
  const { data: presentationContent, isLoading: isLoadingPresentation } = useQuery({
    queryKey: ["presentation-content"],
    queryFn: async () => {
      console.log("Fetching presentation content...");
      const { data, error } = await supabase
        .from("pages_content")
        .select("content, title, image_paths")
        .eq("section", "presentation")
        .maybeSingle();

      if (error) {
        console.error("Error fetching presentation content:", error);
        throw error;
      }

      console.log("Fetched presentation content:", data);
      return data || {
        content: "Aucun contenu de présentation disponible pour le moment.",
        title: "Présentation",
        image_paths: [],
      };
    },
  });

  const tiles = [
    {
      title: "Espace Membre",
      icon: User,
      route: "/login",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Accéder à l'espace membre",
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Nous contacter",
    },
    {
      title: "Podcast",
      icon: Podcast,
      route: "/podcast",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      ariaLabel: "Écouter nos podcasts",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-12 space-y-16" role="main">
        {/* Section 1: Tuiles de Navigation */}
        <section 
          className="grid grid-cols-1 md:grid-cols-3 gap-4" 
          aria-label="Navigation principale"
        >
          {tiles.map((tile) => (
            <Card
              key={tile.title}
              className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white`}
              onClick={() => navigate(tile.route)}
              role="button"
              aria-label={tile.ariaLabel}
              tabIndex={0}
            >
              <CardHeader className="text-center p-6">
                <tile.icon
                  className="w-12 h-12 mx-auto mb-4 text-white"
                  aria-hidden="true"
                />
                <CardTitle className="text-lg font-bold text-white">
                  {tile.title}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </section>

        {/* Section 2: Actualités Défilantes */}
        <section 
          className="w-full" 
          aria-label="Actualités récentes"
        >
          {isLoadingNews ? (
            <div 
              className="flex justify-center items-center h-24" 
              role="status" 
              aria-label="Chargement des actualités"
            >
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
              <span className="sr-only">Chargement des actualités en cours...</span>
            </div>
          ) : news && news.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {news.map((article) => (
                  <CarouselItem key={article.id} className="md:basis-1/2 lg:basis-1/3">
                    <BlogCard
                      title={article.title}
                      excerpt={article.content.substring(0, 150) + "..."}
                      image={article.image_path || "/placeholder.svg"}
                      author="CSAVH31"
                      date={new Date(article.published_at).toLocaleDateString()}
                      categories={["Actualité"]}
                      slug={article.id}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious aria-label="Voir l'actualité précédente" />
              <CarouselNext aria-label="Voir l'actualité suivante" />
            </Carousel>
          ) : (
            <p className="text-center text-gray-400">
              Aucune actualité disponible pour le moment.
            </p>
          )}
        </section>

        {/* Section 3: Présentation */}
        <section 
          className="max-w-4xl mx-auto" 
          aria-label="Présentation du club"
        >
          {isLoadingPresentation ? (
            <div 
              className="flex justify-center items-center h-24" 
              role="status" 
              aria-label="Chargement de la présentation"
            >
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
              <span className="sr-only">Chargement de la présentation en cours...</span>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {presentationContent?.title || "Présentation"}
              </h2>

              {presentationContent?.image_paths && presentationContent.image_paths.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {presentationContent.image_paths.slice(0, 3).map((imagePath, index) => (
                    <img
                      key={index}
                      src={imagePath}
                      alt={`Image de présentation ${index + 1} du club CSAVH31`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {presentationContent?.content || "Aucun contenu de présentation disponible."}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;