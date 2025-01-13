import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AttendanceSheetsList } from "@/components/admin/attendance/AttendanceSheetsList";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/animations/PageTransition";

const AdminAttendanceSheets = () => {
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
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <PageTransition>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Button
              onClick={() => navigate("/admin/settings")}
              variant="ghost"
              className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              aria-label="Retour aux paramètres"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux paramètres
            </Button>
            <h1 className="text-2xl font-bold text-white mb-8">
              Feuilles de Présence
            </h1>
            <AttendanceSheetsList />
          </div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default AdminAttendanceSheets;