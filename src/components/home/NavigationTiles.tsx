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
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Accéder à l'espace membre",
      description: "Connectez-vous à votre espace personnel"
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Nous contacter",
      description: "Envoyez-nous un message"
    },
  ];

  return (
    <nav 
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl mx-auto" 
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
            focus-visible:ring-white 
            focus-visible:outline-none
            animate-fade-in
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
          <CardHeader className="text-center p-6">
            <tile.icon
              className="w-12 h-12 mx-auto mb-4 text-white transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <CardTitle className="text-xl font-bold text-white">
              {tile.title}
            </CardTitle>
            <p className="text-gray-200 mt-2 text-sm">
              {tile.description}
            </p>
            <span className="sr-only">{tile.description}</span>
          </CardHeader>
        </Card>
      ))}
    </nav>
  );
};