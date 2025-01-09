import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, Mail, Newspaper, Users, ListCollapse, FileStack, FileSpreadsheet, Settings, LayoutTemplate } from "lucide-react";

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
      title: "Modifier Contacts",
      icon: Users,
      route: "/admin/settings/contacts",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Gérer les contacts du bureau"
    },
    {
      title: "Gestion des Actualités",
      icon: Newspaper,
      route: "/admin/settings/news",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Gérer les actualités"
    },
    {
      title: "Gestion des Sports et Équipes",
      icon: ListCollapse,
      route: "/admin/settings/sports-teams",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      ariaLabel: "Gérer les sports et les équipes"
    },
    {
      title: "Types de Documents",
      icon: FileStack,
      route: "/admin/settings/document-types",
      bgColor: "bg-teal-600 hover:bg-teal-700",
      ariaLabel: "Gérer les types de documents"
    },
    {
      title: "Télécharger une feuille de présence",
      icon: FileSpreadsheet,
      route: "/admin/settings/attendance-sheets",
      bgColor: "bg-violet-600 hover:bg-violet-700",
      ariaLabel: "Télécharger les feuilles de présence"
    },
    {
      title: "Modifier en-tête, pieds de page et icône",
      icon: Settings,
      route: "/admin/settings/site",
      bgColor: "bg-pink-600 hover:bg-pink-700",
      ariaLabel: "Modifier l'apparence du site"
    },
    {
      title: "Template du Site",
      icon: LayoutTemplate,
      route: "/admin/settings/template",
      bgColor: "bg-amber-600 hover:bg-amber-700",
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
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center sm:text-left">
              Paramètres du Site
            </h1>
            <button
              onClick={() => navigate("/admin")}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Retourner au tableau de bord administrateur"
            >
              Retour
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {settingsTiles.map((tile) => (
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

export default AdminSettings;