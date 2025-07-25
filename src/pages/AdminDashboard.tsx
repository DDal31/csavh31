
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Calendar, Shield, Settings, FileText, Trophy } from "lucide-react";
import { AdminAttendanceBilan } from "@/components/admin/attendance/AdminAttendanceBilan";

const AdminDashboard = () => {
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

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const adminTiles = [
    {
      title: "Gestion des Utilisateurs",
      icon: Users,
      route: "/admin/users",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Accéder à la gestion des utilisateurs"
    },
    {
      title: "Gestion des Entraînements",
      icon: Calendar,
      route: "/admin/trainings",
      bgColor: "bg-violet-600 hover:bg-violet-700",
      ariaLabel: "Accéder à la gestion des entraînements"
    },
    {
      title: "Gestion des Documents",
      icon: FileText,
      route: "/admin/documents",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      ariaLabel: "Gérer les documents des utilisateurs"
    },
    {
      title: "Championnats",
      icon: Trophy,
      route: "/admin/championships",
      bgColor: "bg-rose-600 hover:bg-rose-700",
      ariaLabel: "Gérer les championnats et résultats"
    },
    {
      title: "Paramètres",
      icon: Settings,
      route: "/admin/settings",
      bgColor: "bg-fuchsia-600 hover:bg-fuchsia-700",
      ariaLabel: "Accéder aux paramètres du site"
    }
  ];

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
      <main className="container mx-auto px-4 py-8 sm:py-12" role="main">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">
              Tableau de Bord Administrateur
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-label="Retourner au tableau de bord utilisateur"
            >
              Tableau de Bord Utilisateur
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {adminTiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-white`}
                onClick={() => navigate(tile.route)}
                role="button"
                aria-label={tile.ariaLabel}
                tabIndex={0}
              >
                <CardHeader className="text-center p-4 sm:p-6">
                  <tile.icon 
                    className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-white" 
                    aria-hidden="true"
                  />
                  <CardTitle className="text-sm sm:text-lg font-bold text-white">
                    {tile.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <AdminAttendanceBilan />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
