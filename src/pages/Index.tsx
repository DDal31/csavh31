import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Newspaper, Mail, BookOpen, User } from "lucide-react";
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
      title: "Présentation",
      icon: FileText,
      route: "/presentation",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      description: getContentForSection("presentation").substring(0, 100) + "..."
    },
    {
      title: "Actualités",
      icon: Newspaper,
      route: "/actualites",
      bgColor: "bg-green-600 hover:bg-green-700",
      description: getContentForSection("actualites").substring(0, 100) + "..."
    },
    {
      title: "Blog",
      icon: BookOpen,
      route: "/blog/welcome",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      description: "Découvrez nos articles et actualités détaillés"
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      description: getContentForSection("contact").substring(0, 100) + "..."
    },
    {
      title: "Espace Membre",
      icon: User,
      route: "/login",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      description: "Accédez à votre espace personnel"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
          Club Sportif de l'Association Valentin Haüy
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {tiles.map((tile) => (
            <Card 
              key={tile.title}
              className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105`}
              onClick={() => navigate(tile.route)}
            >
              <CardHeader className="text-center pb-2">
                <tile.icon className="w-16 h-16 mx-auto mb-4 text-white" />
                <CardTitle className="text-2xl font-bold text-white">{tile.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-100 text-center">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    tile.description
                  )}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;