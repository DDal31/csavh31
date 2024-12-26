import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Calendar, Shield, Settings } from "lucide-react";

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
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Accéder à la gestion des utilisateurs"
    },
    {
      title: "Gestion des Entraînements",
      icon: Calendar,
      route: "/admin/trainings",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Accéder à la gestion des entraînements"
    },
    {
      title: "Permissions",
      icon: Shield,
      route: "/admin/permissions",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Gérer les permissions des utilisateurs"
    },
    {
      title: "Paramètres",
      icon: Settings,
      route: "/admin/settings",
      bgColor: "bg-orange-600 hover:bg-orange-700",
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
      <main className="container mx-auto px-4 py-24" role="main">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold text-white">
              Tableau de Bord Administrateur
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
              aria-label="Retourner au tableau de bord utilisateur"
            >
              Tableau de Bord Utilisateur
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {adminTiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white`}
                onClick={() => navigate(tile.route)}
                role="button"
                aria-label={tile.ariaLabel}
                tabIndex={0}
              >
                <CardHeader className="text-center pb-2">
                  <tile.icon 
                    className="w-12 h-12 mx-auto mb-4 text-white" 
                    aria-hidden="true"
                  />
                  <CardTitle className="text-xl font-bold text-white">
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