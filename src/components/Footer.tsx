import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteSettings, SocialMediaLinks } from "@/types/settings";

const Footer = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    site_title: "CSAVH31 Toulouse",
    site_description: "Association dédiée au sport et au bien-être pour les personnes déficientes visuelles.",
    show_description: true,
    show_navigation: true,
    show_social_media: true,
    logo_url: "/club-logo.png"
  });
  
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    twitter: { url: "", is_active: false },
    facebook: { url: "", is_active: false },
    instagram: { url: "", is_active: false }
  });

  useEffect(() => {
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
                     key === "logo_url") {
            acc[key] = curr.setting_value || "";
          }
          return acc;
        }, {
          site_title: "CSAVH31 Toulouse",
          site_description: "Association dédiée au sport et au bien-être pour les personnes déficientes visuelles.",
          show_description: true,
          show_navigation: true,
          show_social_media: true,
          logo_url: "/club-logo.png"
        });

        if (settingsObj.logo_url) {
          const { data: { publicUrl } } = supabase.storage
            .from("site-assets")
            .getPublicUrl(settingsObj.logo_url);
          settingsObj.logo_url = publicUrl;
        }

        setSettings(settingsObj);

        const { data: socialData, error: socialError } = await supabase
          .from("social_media_links")
          .select("*");

        if (socialError) throw socialError;

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
      } catch (error) {
        console.error("Erreur lors du chargement des paramètres:", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={settings.logo_url}
                alt={`Logo ${settings.site_title}`}
                className="h-12 w-auto object-contain rounded-full"
                onError={(e) => {
                  console.error('Erreur de chargement du logo:', e);
                  e.currentTarget.src = "/club-logo.png";
                }}
              />
              <h3 className="text-xl font-bold text-white">{settings.site_title}</h3>
            </div>
            {settings.show_description && (
              <p className="text-sm">
                {settings.site_description}
              </p>
            )}
          </div>
          
          {settings.show_navigation && (
            <>
              <div>
                <h4 className="font-semibold text-white mb-4">Navigation</h4>
                <ul className="space-y-2">
                  <li><Link to="/presentation" className="hover:text-white transition-colors">Présentation</Link></li>
                  <li><Link to="/actualites" className="hover:text-white transition-colors">Actualités</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-4">Informations</h4>
                <ul className="space-y-2">
                  <li><Link to="/presentation" className="hover:text-white transition-colors">À propos</Link></li>
                  <li><Link to="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
                  <li><Link to="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                </ul>
              </div>
            </>
          )}
          
          {settings.show_social_media && (
            <div>
              <h4 className="font-semibold text-white mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                {socialMedia.twitter.is_active && (
                  <a href={socialMedia.twitter.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <Twitter size={20} />
                  </a>
                )}
                {socialMedia.facebook.is_active && (
                  <a href={socialMedia.facebook.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <Facebook size={20} />
                  </a>
                )}
                {socialMedia.instagram.is_active && (
                  <a href={socialMedia.instagram.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <Instagram size={20} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} {settings.site_title}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;