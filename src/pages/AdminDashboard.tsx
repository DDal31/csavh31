
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Calendar, FileText, Settings, Trophy, Upload } from "lucide-react";

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

  const adminTiles = [
    {
      title: "Gestion des Utilisateurs",
      icon: Users,
      route: "/admin/users",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Gérer les utilisateurs du club"
    },
    {
      title: "Gestion des Entraînements",
      icon: Calendar,
      route: "/admin/trainings",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Gérer les entraînements"
    },
    {
      title: "Gestion des Documents",
      icon: FileText,
      route: "/admin/documents",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      ariaLabel: "Gérer les documents des utilisateurs"
    },
    {
      title: "Championnat",
      icon: Trophy,
      route: "/admin/championship",
      bgColor: "bg-yellow-600 hover:bg-yellow-700",
      ariaLabel: "Gérer les données de championnat"
    },
    {
      title: "Paramètres du Site",
      icon: Settings,
      route: "/admin/settings",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Configurer les paramètres du site"
    }
  ];

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
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-gray-300 text-lg">
              Gérez votre club sportif en toute simplicité
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {adminTiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
