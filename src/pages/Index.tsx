import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, User, Newspaper, Mail, Podcast } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  const { data: contents, isLoading } = useQuery({
    queryKey: ["pages-content"],
    queryFn: async () => {
      console.log("Fetching pages content...");
      const { data, error } = await supabase
        .from("pages_content")
        .select("*");
      
      if (error) {
        console.error("Error fetching content:", error);
        throw error;
      }
      
      console.log("Fetched content:", data);
      return data;
    },
  });

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
        image_paths: []
      };
    },
  });

  const getContentForSection = (section: string) => {
    return contents?.find((content) => content.section === section)?.content || "";
  };

  const tiles = [
    {
      title: "Espace Membre",
      icon: User,
      route: "/login",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      description: "Accédez à votre espace personnel",
      ariaLabel: "Accéder à l'espace membre"
    },
    {
      title: "Actualités",
      icon: Newspaper,
      route: "/actualites",
      bgColor: "bg-green-600 hover:bg-green-700",
      description: getContentForSection("actualites").substring(0, 100) + "...",
      ariaLabel: "Consulter les actualités du club"
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      description: getContentForSection("contact").substring(0, 100) + "...",
      ariaLabel: "Nous contacter"
    },
    {
      title: "Podcast",
      icon: Podcast,
      route: "/podcast",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      description: "Écoutez nos derniers podcasts",
      ariaLabel: "Écouter nos podcasts"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 sm:py-24" role="main">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-16 text-white">
          CSAVH31 Toulouse
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 max-w-6xl mx-auto mb-16">
          {tiles.map((tile) => (
            <Card 
              key={tile.title}
              className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white`}
              onClick={() => navigate(tile.route)}
              role="button"
              aria-label={tile.ariaLabel}
              tabIndex={0}
            >
              <CardHeader className="text-center p-2 sm:p-4 pb-2">
                <tile.icon 
                  className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 mx-auto mb-1 sm:mb-2 text-white" 
                  aria-hidden="true"
                />
                <CardTitle className="text-xs sm:text-sm md:text-xl font-bold text-white">
                  {tile.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 pt-0">
                <p className="text-xs sm:text-sm text-gray-100 line-clamp-2">
                  {tile.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Section Présentation */}
        <div className="max-w-4xl mx-auto">
          {isLoadingPresentation ? (
            <div className="flex justify-center items-center h-24" role="status" aria-label="Chargement en cours">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
              <span className="sr-only">Chargement en cours...</span>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
              <h2 className="text-3xl font-bold mb-8 text-center">
                {presentationContent?.title || "Présentation"}
              </h2>
              
              {presentationContent?.image_paths && presentationContent.image_paths.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {presentationContent.image_paths.map((imagePath, index) => (
                    <img 
                      key={index} 
                      src={imagePath} 
                      alt={`Image de présentation ${index + 1} du club`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {presentationContent?.content || "Aucun contenu de présentation disponible."}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;