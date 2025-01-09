import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Activity, Calendar, Shield, Key, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardTilesProps {
  isAdmin: boolean;
}

export function DashboardTiles({ isAdmin }: DashboardTilesProps) {
  const navigate = useNavigate();
  
  const tiles = [
    {
      title: "Mon Profil",
      icon: User,
      route: "/profile",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      ariaLabel: "Accéder à votre profil personnel"
    },
    {
      title: "Inscription Entraînement",
      icon: Activity,
      route: "/training",
      bgColor: "bg-green-600 hover:bg-green-700",
      ariaLabel: "Gérer vos inscriptions aux entraînements"
    },
    {
      title: "Présence",
      icon: Calendar,
      route: "/attendance",
      bgColor: "bg-orange-600 hover:bg-orange-700",
      ariaLabel: "Consulter les présences aux entraînements"
    },
    {
      title: "Mes Documents",
      icon: FileText,
      route: "/documents",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Gérer vos documents personnels"
    },
    {
      title: "Changer le mot de passe",
      icon: Key,
      route: "/change-password",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      ariaLabel: "Modifier votre mot de passe"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {tiles.map((tile) => (
        <Card 
          key={tile.title}
          className={`${tile.bgColor} border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-white`}
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
      
      {isAdmin && (
        <Card 
          className="bg-red-600 hover:bg-red-700 border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-white"
          onClick={() => navigate("/admin")}
          role="button"
          aria-label="Accéder au tableau de bord administrateur"
          tabIndex={0}
        >
          <CardHeader className="text-center p-4 sm:p-6">
            <Shield 
              className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-white" 
              aria-hidden="true"
            />
            <CardTitle className="text-sm sm:text-lg font-bold text-white">
              Espace Admin
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}