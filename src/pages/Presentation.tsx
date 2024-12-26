import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

const Presentation = () => {
  const { data: content, isLoading, error } = useQuery({
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24" role="main">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
          {content?.title || "Présentation"}
        </h1>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24" role="status" aria-label="Chargement en cours">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
              <span className="sr-only">Chargement en cours...</span>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 flex items-center justify-center" role="alert">
              <AlertCircle className="h-12 w-12 text-red-500 mr-4" aria-hidden="true" />
              <p className="text-red-300">
                Une erreur s'est produite lors du chargement du contenu.
              </p>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
              {content?.image_paths && content.image_paths.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {content.image_paths.map((imagePath, index) => (
                    <img 
                      key={index} 
                      src={imagePath} 
                      alt={`Image de présentation ${index + 1} du club`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {content?.content || "Aucun contenu de présentation disponible."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Presentation;