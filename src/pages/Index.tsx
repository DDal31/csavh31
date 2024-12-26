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

  const getContentForSection = (section: string) => {
    return contents?.find((content) => content.section === section)?.content || "";
  };

  const tiles = [
    {
      title: "Espace Membre",
      icon: User,
      route: "/login",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      description: "Accédez à votre espace personnel"
    },
    {
      title: "Actualités",
      icon: Newspaper,
      route: "/actualites",
      bgColor: "bg-green-600 hover:bg-green-700",
      description: getContentForSection("actualites").substring(0, 100) + "..."
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      description: getContentForSection("contact").substring(0, 100) + "..."
    },
    {
      title: "Podcast",
      icon: Podcast,
      route: "/podcast",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      description: "Écoutez nos derniers podcasts"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
          Club Sportif de l'Association Valentin Haüy
        </h1>

        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto">
          {tiles.map((tile) => (
            <Card 
              key={tile.title}
              className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105`}
              onClick={() => navigate(tile.route)}
            >
              <CardHeader className="text-center pb-2">
                <tile.icon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 text-white" />
                <CardTitle className="text-sm md:text-xl font-bold text-white">
                  {tile.title}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;