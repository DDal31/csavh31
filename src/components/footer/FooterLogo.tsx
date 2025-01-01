import { SiteSettings } from "@/types/settings";

interface FooterLogoProps {
  settings: SiteSettings;
}

export const FooterLogo = ({ settings }: FooterLogoProps) => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={settings.logo_url}
        alt={`Logo ${settings.site_title}`}
        className={`h-12 w-12 object-cover ${settings.logo_shape === 'round' ? 'rounded-full' : 'rounded-lg'}`}
        onError={(e) => {
          console.error('Erreur de chargement du logo:', e);
          e.currentTarget.src = "/club-logo.png";
        }}
      />
      <h3 className="text-xl font-bold text-white">{settings.site_title}</h3>
    </div>
  );
};