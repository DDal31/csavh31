import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Contact } from "@/types/contacts";

const Contact = () => {
  const { data: content, isLoading: isLoadingContent } = useQuery({
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
      return data?.content || "";
    },
  });

  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      console.log("Fetching contacts...");
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("status", "active")
        .order('display_order');

      if (error) {
        console.error("Error fetching contacts:", error);
        throw error;
      }

      console.log("Fetched contacts:", data);
      return data as Contact[];
    },
  });

  const isLoading = isLoadingContent || isLoadingContacts;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 sm:py-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white" id="page-title">
          Contact
        </h1>

        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-24" aria-label="Chargement en cours">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <div className="space-y-8">
              {content && content !== "Contactez-nous pour plus d'informations" && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 shadow-lg border border-gray-700">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap text-white">
                    {content}
                  </p>
                </div>
              )}

              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6" 
                role="list" 
                aria-label="Liste des contacts"
              >
                {contacts?.map((contact) => (
                  <Card 
                    key={contact.id} 
                    className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:bg-gray-700/50 transition-colors"
                    role="listitem"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {contact.photo_url && (
                          <img
                            src={contact.photo_url}
                            alt={`Photo de ${contact.first_name} ${contact.last_name}`}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {contact.first_name} {contact.last_name}
                          </h3>
                          <p className="text-gray-300">{contact.role}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
                            <a 
                              href={`tel:${contact.phone}`}
                              className="text-white hover:text-primary transition-colors"
                              aria-label={`Téléphone : ${contact.phone}`}
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" aria-hidden="true" />
                            <a 
                              href={`mailto:${contact.email}`}
                              className="text-white hover:text-primary transition-colors"
                              aria-label={`Email : ${contact.email}`}
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
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