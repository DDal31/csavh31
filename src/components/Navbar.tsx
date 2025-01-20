import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NavbarLogo } from "./navbar/NavbarLogo";
import { NavLinks } from "./navbar/NavLinks";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [siteTitle, setSiteTitle] = useState("CSAVH31 Toulouse");
  const [logoUrl, setLogoUrl] = useState("/club-logo.png");
  const [logoShape, setLogoShape] = useState("round");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let authUnsubscribe: (() => void) | null = null;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      }
    };

    const loadSettings = async () => {
      if (!isLoading) return; // Prevent reloading if already loaded

      try {
        console.log("Loading navbar settings...");
        const { data: settings, error } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value");
        
        if (error) {
          throw error;
        }

        if (isMounted && settings) {
          console.log("Settings loaded:", settings);

          const title = settings.find(s => s.setting_key === "site_title")?.setting_value;
          if (title) {
            setSiteTitle(title);
            document.title = title;
          }

          const shape = settings.find(s => s.setting_key === "logo_shape")?.setting_value;
          if (shape) setLogoShape(shape);

          const logo = settings.find(s => s.setting_key === "logo_url")?.setting_value;
          if (logo) {
            const { data: { publicUrl } } = supabase.storage
              .from("site-assets")
              .getPublicUrl(logo);
            setLogoUrl(publicUrl);
          }
          setIsLoading(false);
        }
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

    checkAuth();
    loadSettings();

    const setupAuthListener = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (isMounted) {
          setIsAuthenticated(!!session);
        }
      });
      authUnsubscribe = subscription.unsubscribe;
    };

    setupAuthListener();

    return () => {
      isMounted = false;
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, [toast]);

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <NavbarLogo 
              siteTitle={siteTitle}
              logoUrl={logoUrl}
              logoShape={logoShape}
            />
          </Link>
          
          <NavLinks isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;