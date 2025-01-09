import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminTemplateSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          console.log("Accès non autorisé : l'utilisateur n'est pas admin");
          navigate("/dashboard");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate("/admin/settings")}
          variant="ghost"
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center"
          aria-label="Retour aux paramètres"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            Template du Site
          </h1>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300">
              Fonctionnalité en cours de développement...
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTemplateSettings;