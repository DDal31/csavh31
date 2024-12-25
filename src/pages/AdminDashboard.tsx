import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

        // Vérifier si l'utilisateur est admin
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
      description: "Gérer les membres du club"
    },
    {
      title: "Gestion des Entraînements",
      icon: Calendar,
      route: "/admin/trainings",
      bgColor: "bg-green-600 hover:bg-green-700",
      description: "Gérer les séances d'entraînement"
    },
    {
      title: "Permissions",
      icon: Shield,
      route: "/admin/permissions",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      description: "Gérer les rôles et permissions"
    },
    {
      title: "Paramètres",
      icon: Settings,
      route: "/admin/settings",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      description: "Configuration du site"
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
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold text-white">
              Dashboard Administrateur
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Dashboard Utilisateur
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {adminTiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105`}
                onClick={() => navigate(tile.route)}
              >
                <CardHeader className="text-center pb-2">
                  <tile.icon className="w-16 h-16 mx-auto mb-4 text-white" />
                  <CardTitle className="text-2xl font-bold text-white">
                    {tile.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-100 text-center">
                    {tile.description}
                  </p>
                </CardContent>
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