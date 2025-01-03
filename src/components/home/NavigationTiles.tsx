import { User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export const NavigationTiles = () => {
  const navigate = useNavigate();
  
  const tiles = [
    {
      title: "Espace Membre",
      icon: User,
      route: "/login",
      bgColor: "bg-primary hover:bg-primary/90",
      ariaLabel: "Accéder à l'espace membre",
      description: "Connectez-vous à votre espace personnel pour accéder à vos informations et documents"
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-primary hover:bg-primary/90",
      ariaLabel: "Nous contacter",
      description: "Envoyez-nous un message ou trouvez nos coordonnées de contact"
    },
  ];

  return (
    <nav 
      className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mx-auto p-4" 
      aria-label="Navigation principale"
    >
      {tiles.map((tile) => (
        <Card
          key={tile.title}
          className={`
            ${tile.bgColor} 
            border-none 
            cursor-pointer 
            transform 
            transition-all 
            duration-300 
            hover:scale-105 
            focus-visible:ring-2 
            focus-visible:ring-offset-2
            focus-visible:ring-white 
            focus-visible:outline-none
            shadow-lg
            group
          `}
          onClick={() => navigate(tile.route)}
          role="link"
          aria-label={tile.ariaLabel}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(tile.route);
            }
          }}
        >
          <CardHeader className="text-center p-8">
            <tile.icon
              className="w-16 h-16 mx-auto mb-6 text-white transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl font-bold text-white mb-4">
              {tile.title}
            </CardTitle>
            <p className="text-gray-100 mt-2">
              {tile.description}
            </p>
            <span className="sr-only">{`${tile.ariaLabel} - ${tile.description}`}</span>
          </CardHeader>
        </Card>
      ))}
    </nav>
  );
};