import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Activity, Calendar, FileText, MessageSquare, Shield } from "lucide-react";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const tiles = [
    {
      title: "Mon Profil",
      icon: User,
      route: "/profile",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      description: "Gérer vos informations personnelles"
    },
    {
      title: "Inscription Entraînement",
      icon: Activity,
      route: "/training",
      bgColor: "bg-green-600 hover:bg-green-700",
      description: "Gérer vos inscriptions aux entraînements"
    },
    {
      title: "Présence",
      icon: Calendar,
      route: "/attendance",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      description: "Consulter les présences aux entraînements"
    },
    {
      title: "Documents",
      icon: FileText,
      route: "/documents",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      description: "Accéder à vos documents"
    },
    {
      title: "Conseil",
      icon: MessageSquare,
      route: "/advice",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      description: "Obtenir des conseils personnalisés"
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
              Bienvenue !
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {tiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105`}
                onClick={() => navigate(tile.route)}
              >
                <CardHeader className="text-center pb-2">
                  <tile.icon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white" />
                  <CardTitle className="text-lg md:text-2xl font-bold text-white">
                    {tile.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-100 text-center">
                    {tile.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            
            {isAdmin && (
              <Card 
                className="bg-red-600 hover:bg-red-700 border-none cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => navigate("/admin")}
              >
                <CardHeader className="text-center pb-2">
                  <Shield className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white" />
                  <CardTitle className="text-lg md:text-2xl font-bold text-white">
                    Dashboard Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm md:text-base text-gray-100 text-center">
                    Accéder à l'espace administrateur
                  </p>
                </CardContent>
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