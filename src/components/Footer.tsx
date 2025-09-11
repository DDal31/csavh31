import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, SocialMediaLinks } from "@/types/settings";
import { FooterLogo } from "./footer/FooterLogo";
import { FooterNavigation } from "./footer/FooterNavigation";
import { FooterSocial } from "./footer/FooterSocial";
import { useToast } from "@/components/ui/use-toast";
import { BottomNav } from "./navigation/BottomNav";

const Footer = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: "CSAVH31 Toulouse",
    site_description: "Association dédiée au sport et au bien-être pour les personnes déficientes visuelles.",
    show_description: true,
    show_navigation: true,
    show_social_media: true,
    logo_url: "/club-logo.png",
    logo_shape: "round"
  });
  
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    twitter: { url: "", is_active: false },
    facebook: { url: "", is_active: false },
    instagram: { url: "", is_active: false }
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      if (!isLoading) return;

      try {
        console.log("Loading footer settings...");
        const { data: settingsData, error: settingsError } = await supabase
          .from("site_settings")
          .select("*");

        if (settingsError) throw settingsError;

        if (!isMounted) return;

        console.log("Settings data received:", settingsData);

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
          return acc;
        }, {
          site_title: "CSAVH31 Toulouse",
          site_description: "Association dédiée au sport et au bien-être pour les personnes déficientes visuelles.",
          show_description: true,
          show_navigation: true,
          show_social_media: true,
          logo_url: "/club-logo.png",
          logo_shape: "round"
        });

        if (settingsObj.logo_url) {
          if (!settingsObj.logo_url.startsWith("http")) {
            const normalizedPath = settingsObj.logo_url.replace(/^site-assets\//, "");
            const { data: { publicUrl } } = supabase.storage
              .from("site-assets")
              .getPublicUrl(normalizedPath);
            settingsObj.logo_url = publicUrl;
          }
        }

        setSettings(settingsObj);

        const { data: socialData, error: socialError } = await supabase
          .from("social_media_links")
          .select("*");

        if (socialError) throw socialError;

        if (!isMounted) return;

        const socialObj = socialData.reduce<SocialMediaLinks>((acc, curr) => {
          const platform = curr.platform as keyof SocialMediaLinks;
          acc[platform] = { 
            url: curr.url, 
            is_active: curr.is_active 
          };
          return acc;
        }, {
          twitter: { url: "", is_active: false },
          facebook: { url: "", is_active: false },
          instagram: { url: "", is_active: false }
        });

        setSocialMedia(socialObj);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        if (isMounted) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les paramètres du site",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  return (
    <>
      {isAuthenticated ? (
        <BottomNav />
      ) : (
        <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <FooterLogo settings={settings} />
                {settings.show_description && (
                  <p className="text-sm">{settings.site_description}</p>
                )}
              </div>
              
              {settings.show_navigation && <FooterNavigation />}
              
              {settings.show_social_media && <FooterSocial socialMedia={socialMedia} />}
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
              <p>&copy; {new Date().getFullYear()} {settings.site_title}. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;