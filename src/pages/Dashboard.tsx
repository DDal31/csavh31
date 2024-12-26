import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Activity, Calendar, Shield } from "lucide-react";

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/"); // Redirect to homepage after sign out
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

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
      <main className="container mx-auto px-4 py-12" role="main">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">
              Bienvenue !
            </h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-400 focus:outline-none"
              aria-label="Se déconnecter de votre compte"
            >
              Déconnexion
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {tiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white h-24 sm:h-32`}
                onClick={() => navigate(tile.route)}
                role="button"
                aria-label={tile.ariaLabel}
                tabIndex={0}
              >
                <CardHeader className="text-center p-2 sm:p-4">
                  <tile.icon 
                    className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-white" 
                    aria-hidden="true"
                  />
                  <CardTitle className="text-sm sm:text-lg font-bold text-white">
                    {tile.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
            
            {isAdmin && (
              <Card 
                className="bg-red-600 hover:bg-red-700 border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white h-24 sm:h-32"
                onClick={() => navigate("/admin")}
                role="button"
                aria-label="Accéder au tableau de bord administrateur"
                tabIndex={0}
              >
                <CardHeader className="text-center p-2 sm:p-4">
                  <Shield 
                    className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 text-white" 
                    aria-hidden="true"
                  />
                  <CardTitle className="text-sm sm:text-lg font-bold text-white">
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