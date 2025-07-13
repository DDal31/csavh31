
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, User, BarChart3, Trophy } from "lucide-react";

const DashboardTiles = () => {
  const navigate = useNavigate();

  const tiles = [
    {
      title: "Entraînements",
      icon: Calendar,
      route: "/training",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Consulter les entraînements"
    },
    {
      title: "Présences",
      icon: BarChart3,
      route: "/attendance",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Consulter les statistiques de présence"
    },
    {
      title: "Documents",
      icon: FileText,
      route: "/documents",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      ariaLabel: "Gérer vos documents"
    },
    {
      title: "Championnat",
      icon: Trophy,
      route: "/championship",
      bgColor: "bg-yellow-600 hover:bg-yellow-700",
      ariaLabel: "Consulter les résultats du championnat"
    },
    {
      title: "Profil",
      icon: User,
      route: "/profile",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Gérer votre profil"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
      {tiles.map((tile) => (
        <Card 
          key={tile.title}
          className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
          onClick={() => navigate(tile.route)}
          role="button"
          aria-label={tile.ariaLabel}
          tabIndex={0}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <tile.icon 
              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-white" 
              aria-hidden="true"
            />
            <CardTitle className="text-sm sm:text-lg font-bold text-white">
              {tile.title}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

export default DashboardTiles;
