import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactsList from "@/components/admin/contacts/ContactsList";
import ContactForm from "@/components/admin/contacts/ContactForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Loader2 } from "lucide-react";

const AdminContacts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication and admin rights...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (!profile || profile.site_role !== "admin") {
          console.log("User is not admin, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }

        console.log("Auth check passed, user is admin");
        setLoading(false);
      } catch (error) {
        console.error("Error during auth check:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              className="text-white w-fit flex items-center gap-2 hover:text-gray-300"
              onClick={() => navigate("/admin/settings")}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Gestion des Contacts
            </h1>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau Contact
            </Button>
          </div>

          {showForm ? (
            <ContactForm 
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                toast({
                  title: "Succès",
                  description: "Le contact a été ajouté avec succès",
                });
              }}
            />
          ) : (
            <ContactsList />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminContacts;