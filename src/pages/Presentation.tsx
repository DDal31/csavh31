import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Presentation = () => {
  const { data: content, isLoading } = useQuery({
    queryKey: ["presentation-content"],
    queryFn: async () => {
      console.log("Fetching presentation content...");
      const { data, error } = await supabase
        .from("pages_content")
        .select("content")
        .eq("section", "presentation")
        .single();
      
      if (error) {
        console.error("Error fetching presentation content:", error);
        throw error;
      }
      
      console.log("Fetched presentation content:", data);
      return data?.content || "";
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Présentation
        </h1>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Presentation;