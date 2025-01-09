import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTiles } from "@/components/dashboard/DashboardTiles";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSports, setUserSports] = useState<string[]>([]);

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
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setIsAdmin(profile.site_role === "admin");
          // Split sports string into array and trim whitespace
          const sports = profile.sport.split(',').map((s: string) => s.trim());
          setUserSports(sports);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" role="status" aria-label="Chargement en cours">
        <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden="true" />
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12" role="main">
        <div className="max-w-6xl mx-auto">
          <DashboardHeader onSignOut={handleSignOut} />
          <DashboardTiles isAdmin={isAdmin} userSports={userSports} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;