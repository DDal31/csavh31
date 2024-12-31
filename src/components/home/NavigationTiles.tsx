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
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Accéder à l'espace membre",
    },
    {
      title: "Contact",
      icon: Mail,
      route: "/contact",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Nous contacter",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full">
      {tiles.map((tile) => (
        <Card
          key={tile.title}
          className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-white min-w-[100px]`}
          onClick={() => navigate(tile.route)}
          role="button"
          aria-label={tile.ariaLabel}
          tabIndex={0}
        >
          <CardHeader className="text-center p-2 sm:p-6">
            <tile.icon
              className="w-6 h-6 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-white"
              aria-hidden="true"
            />
            <CardTitle className="text-xs sm:text-lg font-bold text-white">
              {tile.title}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};