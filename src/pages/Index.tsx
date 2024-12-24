import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
          Club Sportif de l'Association Valentin Haüy
        </h1>

        {/* Presentation Section */}
        <section className="mb-16">
          <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 text-center">Présentation du Club</h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <p className="text-lg leading-relaxed text-center">
                {getContentForSection("presentation")}
              </p>
            )}
          </div>
        </section>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Présentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {getContentForSection("presentation")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Actualités</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {getContentForSection("actualites")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed">
                  {getContentForSection("contact")}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;