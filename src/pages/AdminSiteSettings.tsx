import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogoSection } from "@/components/admin/settings/LogoSection";
import { TitleSection } from "@/components/admin/settings/TitleSection";
import { SiteSettings } from "@/types/settings";
import PageTransition from "@/components/animations/PageTransition";

const AdminSiteSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: "",
    site_description: "",
    show_description: true,
    show_navigation: true,
    show_social_media: true,
    logo_url: "/club-logo.png",
    logo_shape: "round"
  });

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

        await loadSettings();
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("*");

      if (settingsError) throw settingsError;

      const settingsObj = settingsData.reduce<SiteSettings>((acc, curr) => {
        const key = curr.setting_key as keyof SiteSettings;
        if (key === "show_description" ||
            key === "show_navigation" ||
            key === "show_social_media") {
          acc[key] = curr.setting_value === "true";
        } else if (key === "site_title" ||
                   key === "site_description" ||
                   key === "logo_url" ||
                   key === "logo_shape") {
          acc[key] = curr.setting_value || "";
        }

        // Fallback: if icon_club-logo_png exists, prefer its full URL for logo_url when needed
        if (curr.setting_key === "icon_club-logo_png") {
          const url = curr.setting_value || "";
          if (!acc.logo_url || !acc.logo_url.startsWith("http")) {
            acc.logo_url = url;
          }
        }

        return acc;
      }, {
        site_title: "",
        site_description: "",
        show_description: true,
        show_navigation: true,
        show_social_media: true,
        logo_url: "/club-logo.png",
        logo_shape: "round"
      });

      // Normaliser l'URL du logo: si c'est un chemin de fichier, construire l'URL publique du bucket
      if (settingsObj.logo_url && !settingsObj.logo_url.startsWith("http")) {
        const normalizedPath = settingsObj.logo_url.replace(/^site-assets\//, "");
        const { data: { publicUrl } } = supabase.storage
          .from("site-assets")
          .getPublicUrl(normalizedPath);
        settingsObj.logo_url = publicUrl;
      }

      setSettings(settingsObj);
    } catch (error) {
      console.error("Error in loadSettings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres du site",
        variant: "destructive"
      });
    }
  };

  const handleSettingChange = async (key: string, value: string | boolean) => {
    try {
      const { error: updateError } = await supabase
        .from("site_settings")
        .upsert({ 
          setting_key: key, 
          setting_value: value.toString() 
        });

      if (updateError) throw updateError;

      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Succès",
        description: "Paramètres mis à jour avec succès"
      });
    } catch (error) {
      console.error("Error in handleSettingChange:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    }
  };

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
      <PageTransition>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Paramètres du site</h1>
              <Button
                onClick={() => navigate("/admin/settings")}
                variant="outline"
              >
                Retour
              </Button>
            </div>

            <LogoSection 
              settings={settings} 
              onSettingChange={handleSettingChange} 
            />

            <TitleSection 
              settings={settings} 
              onSettingChange={handleSettingChange} 
            />
          </div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default AdminSiteSettings;