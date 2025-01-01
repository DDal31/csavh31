import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SiteSettings, SocialMediaLinks } from "@/types/settings";

const AdminSiteSettings = () => {
  console.log("Rendering AdminSiteSettings component");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: "",
    site_description: "",
    show_description: true,
    show_navigation: true,
    show_social_media: true,
    logo_url: "/club-logo.png"
  });
  
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    twitter: { url: "", is_active: true },
    facebook: { url: "", is_active: true },
    instagram: { url: "", is_active: true }
  });

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        if (!profile || profile.site_role !== "admin") {
          console.log("User is not admin, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }

        console.log("Auth check passed, loading settings...");
        await loadSettings();
        setLoading(false);
      } catch (error) {
        console.error("Error during auth check:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadSettings = async () => {
    console.log("Loading settings...");
    try {
      const { data: settingsData, error: settingsError } = await supabase
        .from("site_settings")
        .select("*");

      if (settingsError) {
        console.error("Error loading settings:", settingsError);
        throw settingsError;
      }

      console.log("Settings data received:", settingsData);

      const settingsObj = settingsData.reduce<SiteSettings>((acc, curr) => {
        const key = curr.setting_key as keyof SiteSettings;
        if (key === "show_description" || 
            key === "show_navigation" || 
            key === "show_social_media") {
          acc[key] = curr.setting_value === "true";
        } else if (key === "site_title" || 
                   key === "site_description" || 
                   key === "logo_url") {
          acc[key] = curr.setting_value || "";
        }
        return acc;
      }, {
        site_title: "",
        site_description: "",
        show_description: true,
        show_navigation: true,
        show_social_media: true,
        logo_url: "/club-logo.png"
      });

      console.log("Processed settings:", settingsObj);
      setSettings(settingsObj);

      const { data: socialData, error: socialError } = await supabase
        .from("social_media_links")
        .select("*");

      if (socialError) {
        console.error("Error loading social media links:", socialError);
        throw socialError;
      }

      console.log("Social media data received:", socialData);

      const socialObj = socialData.reduce<SocialMediaLinks>((acc, curr) => {
        const platform = curr.platform as keyof SocialMediaLinks;
        acc[platform] = { 
          url: curr.url, 
          is_active: curr.is_active 
        };
        return acc;
      }, {
        twitter: { url: "", is_active: true },
        facebook: { url: "", is_active: true },
        instagram: { url: "", is_active: true }
      });

      console.log("Processed social media:", socialObj);
      setSocialMedia(socialObj);
    } catch (error) {
      console.error("Error in loadSettings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres du site",
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Handling logo upload...");
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Vérifier les dimensions de l'image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = () => {
          if (img.width !== 512 || img.height !== 512) {
            toast({
              title: "Erreur",
              description: "L'image doit être de 512x512 pixels",
              variant: "destructive"
            });
            setUploading(false);
            return;
          }
          resolve(true);
        };
      });

      console.log("Uploading logo to storage...");
      const { data, error } = await supabase.storage
        .from("site-assets")
        .upload(`logo.${file.name.split(".").pop()}`, file, {
          upsert: true
        });

      if (error) {
        console.error("Error uploading logo:", error);
        throw error;
      }

      console.log("Logo uploaded successfully:", data);

      // Mettre à jour le paramètre logo_url
      const { error: updateError } = await supabase
        .from("site_settings")
        .upsert({ 
          setting_key: "logo_url", 
          setting_value: data.path 
        });

      if (updateError) {
        console.error("Error updating logo_url setting:", updateError);
        throw updateError;
      }

      console.log("Logo URL updated in settings");
      toast({
        title: "Succès",
        description: "Logo mis à jour avec succès"
      });
    } catch (error) {
      console.error("Error in handleLogoUpload:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSettingChange = async (key: string, value: string | boolean) => {
    console.log("Handling setting change:", { key, value });
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ 
          setting_key: key, 
          setting_value: value.toString() 
        });

      if (error) {
        console.error("Error updating setting:", error);
        throw error;
      }

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

  const handleSocialMediaChange = async (platform: string, field: 'url' | 'is_active', value: string | boolean) => {
    console.log("Handling social media change:", { platform, field, value });
    try {
      const { error } = await supabase
        .from("social_media_links")
        .update({ [field]: value })
        .eq("platform", platform);

      if (error) {
        console.error("Error updating social media:", error);
        throw error;
      }

      setSocialMedia(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          [field]: value
        }
      }));

      toast({
        title: "Succès",
        description: "Réseaux sociaux mis à jour avec succès"
      });
    } catch (error) {
      console.error("Error in handleSocialMediaChange:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les réseaux sociaux",
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

          {/* Logo Upload Section */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Logo du site</h2>
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-white">
                Télécharger un nouveau logo (512x512 pixels)
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="bg-gray-700 text-white"
                aria-label="Sélectionner un fichier pour le logo du site"
              />
            </div>
          </div>

          {/* Site Title Section */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Titre du site</h2>
            <div className="space-y-2">
              <Label htmlFor="site_title" className="text-white">
                Titre affiché dans l'en-tête
              </Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) => handleSettingChange("site_title", e.target.value)}
                className="bg-gray-700 text-white"
                placeholder="Titre du site"
                aria-label="Modifier le titre du site"
              />
            </div>
          </div>

          {/* Footer Settings Section */}
          <div className="bg-gray-800 p-6 rounded-lg space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pied de page</h2>
            
            {/* Description Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_description"
                  checked={settings.show_description}
                  onCheckedChange={(checked) => 
                    handleSettingChange("show_description", checked)
                  }
                  aria-label="Afficher la description dans le pied de page"
                />
                <Label htmlFor="show_description" className="text-white">
                  Afficher la description
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_description" className="text-white">
                  Description du site
                </Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => handleSettingChange("site_description", e.target.value)}
                  className="bg-gray-700 text-white min-h-[100px]"
                  placeholder="Description du site"
                  aria-label="Modifier la description du site"
                />
              </div>
            </div>

            {/* Navigation Links Setting */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_navigation"
                checked={settings.show_navigation}
                onCheckedChange={(checked) => 
                  handleSettingChange("show_navigation", checked)
                }
                aria-label="Afficher les liens de navigation dans le pied de page"
              />
              <Label htmlFor="show_navigation" className="text-white">
                Afficher les liens de navigation
              </Label>
            </div>

            {/* Social Media Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_social_media"
                  checked={settings.show_social_media}
                  onCheckedChange={(checked) => 
                    handleSettingChange("show_social_media", checked)
                  }
                  aria-label="Afficher les réseaux sociaux dans le pied de page"
                />
                <Label htmlFor="show_social_media" className="text-white">
                  Afficher les réseaux sociaux
                </Label>
              </div>

              {Object.entries(socialMedia).map(([platform, data]) => (
                <div key={platform} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${platform}_active`}
                      checked={data.is_active}
                      onCheckedChange={(checked) => 
                        handleSocialMediaChange(platform, "is_active", checked)
                      }
                      aria-label={`Activer ${platform}`}
                    />
                    <Label htmlFor={`${platform}_active`} className="text-white capitalize">
                      {platform}
                    </Label>
                  </div>
                  <Input
                    id={`${platform}_url`}
                    value={data.url}
                    onChange={(e) => handleSocialMediaChange(platform, "url", e.target.value)}
                    className="bg-gray-700 text-white"
                    placeholder={`URL ${platform}`}
                    aria-label={`URL du compte ${platform}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSiteSettings;