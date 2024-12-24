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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900">
          Club Sportif de l'Association Valentin Haüy
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Présentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {getContentForSection("presentation")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Actualités</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {getContentForSection("actualites")}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
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