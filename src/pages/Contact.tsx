import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const { data: content, isLoading } = useQuery({
    queryKey: ["contact-content"],
    queryFn: async () => {
      console.log("Fetching contact content...");
      const { data, error } = await supabase
        .from("pages_content")
        .select("content")
        .eq("section", "contact")
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching contact content:", error);
        throw error;
      }
      
      console.log("Fetched contact content:", data);
      return data?.content || "Contenu en cours de rédaction...";
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Contact
        </h1>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-700">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex items-center space-x-4">
                  <Mail className="h-6 w-6 text-blue-400" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-300">contact@clubsportif-avh.fr</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex items-center space-x-4">
                  <Phone className="h-6 w-6 text-green-400" />
                  <div>
                    <h3 className="font-semibold">Téléphone</h3>
                    <p className="text-gray-300">01 23 45 67 89</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700 flex items-center space-x-4">
                  <MapPin className="h-6 w-6 text-purple-400" />
                  <div>
                    <h3 className="font-semibold">Adresse</h3>
                    <p className="text-gray-300">5 Rue Duroc, 75007 Paris</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;