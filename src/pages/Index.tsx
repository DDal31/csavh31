import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NavigationTiles } from "@/components/home/NavigationTiles";
import { NewsCarousel } from "@/components/home/NewsCarousel";
import { ErrorBoundary } from "react-error-boundary";
import PageTransition from "@/components/animations/PageTransition";

const ErrorFallback = ({ error }: { error: Error }) => {
  console.error("Error in Index page:", error);
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold">Une erreur est survenue</h2>
        <p>Nous nous excusons pour ce désagrément. Veuillez rafraîchir la page.</p>
      </div>
    </div>
  );
};

const IndexContent = () => {
  console.log("Rendering IndexContent");
  
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />

        <main className="container mx-auto px-4 py-12 space-y-16" role="main">
          <section className="w-full" aria-label="Navigation principale">
            <NavigationTiles />
          </section>

          <section className="w-full" aria-label="Actualités récentes">
            <NewsCarousel />
          </section>

          <section className="max-w-4xl mx-auto" aria-label="Présentation du club">
            {isLoadingPresentation ? (
              <div className="flex justify-center items-center h-24" role="status" aria-label="Chargement de la présentation">
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
    </PageTransition>
  );
};

const Index = () => {
  console.log("Rendering Index page");
  
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <IndexContent />
    </ErrorBoundary>
  );
};

export default Index;