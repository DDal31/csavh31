import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainingManagement } from "@/components/admin/training/TrainingManagement";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminTrainings = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.site_role !== "admin") {
          console.log("Accès non autorisé : l'utilisateur n'est pas admin");
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <Button
          onClick={() => navigate("/admin/dashboard")}
          variant="ghost"
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center"
          aria-label="Retour au tableau de bord administrateur"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour au tableau de bord
        </Button>
        <TrainingManagement />
      </main>
      <Footer />
    </div>
  );
};

export default AdminTrainings;