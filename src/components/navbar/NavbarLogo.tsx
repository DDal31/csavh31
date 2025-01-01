interface NavbarLogoProps {
  siteTitle: string;
  logoUrl: string;
  logoShape: string;
}

export const NavbarLogo = ({ siteTitle, logoUrl, logoShape }: NavbarLogoProps) => {
  return (
    <div className="flex items-center">
      <img 
        src={logoUrl}
        alt={`Logo ${siteTitle}`}
        className={`h-10 w-10 object-cover ${logoShape === 'round' ? 'rounded-full' : 'rounded-lg'}`}
        onError={(e) => {
          console.error('Erreur de chargement du logo:', e);
          e.currentTarget.src = "/club-logo.png";
        }}
      />
      <span className="text-xl font-bold text-white ml-3">{siteTitle}</span>
    </div>
  );
};