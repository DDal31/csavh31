import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [siteTitle, setSiteTitle] = useState("CSAVH31 Toulouse");
  const [logoUrl, setLogoUrl] = useState("/club-logo.png");
  const [logoShape, setLogoShape] = useState("round");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    const loadSettings = async () => {
      console.log("Loading navbar settings...");
      const { data: settings, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");
      
      if (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
        return;
      }

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

      // Set favicon and Apple touch icons
      const favicon = settings.find(s => s.setting_key === "favicon_url")?.setting_value;
      if (favicon) {
        const { data: { publicUrl } } = supabase.storage
          .from("site-assets")
          .getPublicUrl(favicon);
        const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = publicUrl;
        }
      }

      const appleIcon = settings.find(s => s.setting_key === "apple_touch_icon_url")?.setting_value;
      if (appleIcon) {
        const { data: { publicUrl } } = supabase.storage
          .from("site-assets")
          .getPublicUrl(appleIcon);
        const appleIconLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (appleIconLink) {
          appleIconLink.href = publicUrl;
        }
      }
    };

    checkAuth();
    loadSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3">
              <img 
                src={logoUrl}
                alt={`Logo ${siteTitle}`}
                className={`h-10 w-10 object-cover ${logoShape === 'round' ? 'rounded-full' : 'rounded-lg'}`}
                onError={(e) => {
                  console.error('Erreur de chargement du logo:', e);
                  e.currentTarget.src = "/club-logo.png";
                }}
              />
              <span className="text-xl font-bold text-white">{siteTitle}</span>
            </Link>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Accueil
            </Link>
            <Link to="/presentation" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Présentation
            </Link>
            <Link to="/actualites" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Actualités
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
              Contact
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;