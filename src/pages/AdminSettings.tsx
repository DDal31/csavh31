import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Mail, Newspaper, Palette } from "lucide-react";

const AdminSettings = () => {
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

  const settingsTiles = [
    {
      title: "Modifier Présentation",
      icon: FileText,
      route: "/admin/settings/presentation",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Modifier la page de présentation"
    },
    {
      title: "Modifier Contact",
      icon: Mail,
      route: "/admin/settings/contact",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Modifier la page de contact"
    },
    {
      title: "Gestion des Actualités",
      icon: Newspaper,
      route: "/admin/settings/news",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Gérer les actualités"
    },
    {
      title: "Template du Site",
      icon: Palette,
      route: "/admin/settings/template",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      ariaLabel: "Modifier le template du site"
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
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Paramètres du Site</h1>
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Retourner au tableau de bord administrateur"
            >
              Retour
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settingsTiles.map((tile) => (
              <Card 
                key={tile.title}
                className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105`}
                onClick={() => navigate(tile.route)}
                role="button"
                aria-label={tile.ariaLabel}
              >
                <CardHeader className="text-center p-6">
                  <tile.icon className="w-12 h-12 mx-auto mb-4 text-white" />
                  <CardTitle className="text-lg font-bold text-white">
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

export default AdminSettings;