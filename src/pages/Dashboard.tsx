import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Activity, Calendar } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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

        setUserProfile(profile);
        setIsAdmin(profile?.site_role === "admin");
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  const tiles = [
    {
      title: "Mon Profil",
      icon: User,
      route: "/profile",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Accéder à votre profil personnel"
    },
    {
      title: "Inscription Entraînement",
      icon: Activity,
      route: "/training",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Gérer vos inscriptions aux entraînements"
    },
    {
      title: "Présence",
      icon: Calendar,
      route: "/attendance",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      ariaLabel: "Consulter les présences aux entraînements"
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
              Bienvenue !
            </h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
              aria-label="Se déconnecter de votre compte"
            >
              Déconnexion
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {tiles.map((tile) => (
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
                    className="w-12 h-12 mx-auto mb-2 text-white" 
                    aria-hidden="true"
                  />
                  <CardTitle className="text-xl font-bold text-white">
                    {tile.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
            
            {isAdmin && (
              <Card 
                className="bg-red-600 hover:bg-red-700 border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white"
                onClick={() => navigate("/admin")}
                role="button"
                aria-label="Accéder au tableau de bord administrateur"
                tabIndex={0}
              >
                <CardHeader className="text-center pb-2">
                  <Shield 
                    className="w-12 h-12 mx-auto mb-2 text-white" 
                    aria-hidden="true"
                  />
                  <CardTitle className="text-xl font-bold text-white">
                    Espace Admin
                  </CardTitle>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;