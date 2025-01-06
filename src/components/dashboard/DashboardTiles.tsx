import { Card } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Bell,
  FileText,
  Settings,
  Mail,
  Newspaper,
  Phone,
} from "lucide-react";

interface DashboardTilesProps {
  onTileClick: (path: string) => void;
}

export const DashboardTiles = ({ onTileClick }: DashboardTilesProps) => {
  const tiles = [
    {
      title: "Utilisateurs",
      icon: Users,
      path: "/admin/users",
      description: "Gérer les utilisateurs",
    },
    {
      title: "Entraînements",
      icon: Calendar,
      path: "/admin/trainings",
      description: "Gérer les entraînements",
    },
    {
      title: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
      description: "Gérer les notifications",
    },
    {
      title: "Documents",
      icon: FileText,
      path: "/admin/documents",
      description: "Gérer les documents",
    },
    {
      title: "Paramètres",
      icon: Settings,
      path: "/admin/settings",
      description: "Paramètres du site",
    },
    {
      title: "Newsletter",
      icon: Mail,
      path: "/admin/newsletter",
      description: "Gérer la newsletter",
    },
    {
      title: "Actualités",
      icon: Newspaper,
      path: "/admin/news",
      description: "Gérer les actualités",
    },
    {
      title: "Contacts",
      icon: Phone,
      path: "/admin/contacts",
      description: "Gérer les contacts",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <Card
            key={tile.path}
            className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => onTileClick(tile.path)}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <Icon className="h-12 w-12 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">{tile.title}</h2>
              <p className="text-gray-400">{tile.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};