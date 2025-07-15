import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Activity, Calendar, Shield, Key, FileText, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardCharts } from "./DashboardCharts";
import type { Database } from "@/integrations/supabase/types";

type TrainingType = Database["public"]["Enums"]["training_type"];

interface DashboardTilesProps {
  isAdmin: boolean;
  userSports?: string[];
}

export function DashboardTiles({ isAdmin, userSports = [] }: DashboardTilesProps) {
  const navigate = useNavigate();
  
  const tiles = [
    {
      title: "Mon Profil",
      icon: User,
      route: "/profile",
      bgColor: "bg-purple-600 hover:bg-purple-700",
      ariaLabel: "Accéder à votre profil personnel"
    },
    {
      title: "Inscription Entraînement",
      icon: Activity,
      route: "/training",
      bgColor: "bg-violet-600 hover:bg-violet-700",
      ariaLabel: "Gérer vos inscriptions aux entraînements"
    },
    {
      title: "Présence",
      icon: Calendar,
      route: "/attendance",
      bgColor: "bg-indigo-600 hover:bg-indigo-700",
      ariaLabel: "Consulter les présences aux entraînements"
    },
    {
      title: "Mes Documents",
      icon: FileText,
      route: "/documents",
      bgColor: "bg-fuchsia-600 hover:bg-fuchsia-700",
      ariaLabel: "Gérer vos documents personnels"
    },
    {
      title: "Changer le mot de passe",
      icon: Key,
      route: "/change-password",
      bgColor: "bg-pink-600 hover:bg-pink-700",
      ariaLabel: "Modifier votre mot de passe"
    },
    {
      title: "Résultats Championnat",
      icon: Trophy,
      route: "/championship-results",
      bgColor: "bg-yellow-600 hover:bg-yellow-700",
      ariaLabel: "Voir les résultats des championnats"
    }
  ];

  // Function to normalize sport names and ensure they match TrainingType
  const normalizeSport = (sport: string): TrainingType => {
    const normalizedSport = sport.toLowerCase();
    if (normalizedSport === 'goalball' || 
        normalizedSport === 'torball' || 
        normalizedSport === 'other' || 
        normalizedSport === 'showdown') {
      return normalizedSport;
    }
    return 'goalball'; // Default fallback
  };

  // Get unique sports from userSports and ensure they match TrainingType
  const uniqueSports = [...new Set(userSports.flatMap(sport => 
    sport.toLowerCase() === 'both' ? ['goalball', 'torball'] : [sport.toLowerCase()]
  ))].map(sport => normalizeSport(sport));

  return (
    <div className="space-y-8">
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
            className="bg-rose-600 hover:bg-rose-700 border-none cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-white"
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

      {uniqueSports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {uniqueSports.map(sport => (
            <div key={sport} className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Statistiques {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </h2>
              <DashboardCharts sport={sport} />
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}