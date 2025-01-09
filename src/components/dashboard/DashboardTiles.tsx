import { Link } from "react-router-dom";
import { 
  CalendarDays, 
  ClipboardList, 
  FileText, 
  Settings, 
  Users 
} from "lucide-react";

interface DashboardTilesProps {
  isAdmin: boolean;
}

export function DashboardTiles({ isAdmin }: DashboardTilesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Link
        to="/training"
        className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-4">
          <CalendarDays className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-semibold text-white">Entraînements</h3>
        </div>
        <p className="mt-2 text-gray-400">
          Consultez et inscrivez-vous aux entraînements
        </p>
      </Link>

      <Link
        to="/documents"
        className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-4">
          <FileText className="h-6 w-6 text-blue-500" />
          <h3 className="text-lg font-semibold text-white">Documents</h3>
        </div>
        <p className="mt-2 text-gray-400">
          Accédez à vos documents personnels
        </p>
      </Link>

      {isAdmin && (
        <>
          <Link
            to="/admin/users"
            className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Users className="h-6 w-6 text-purple-500" />
              <h3 className="text-lg font-semibold text-white">Utilisateurs</h3>
            </div>
            <p className="mt-2 text-gray-400">
              Gérez les utilisateurs du site
            </p>
          </Link>

          <Link
            to="/admin/trainings"
            className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <ClipboardList className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">
                Gestion des entraînements
              </h3>
            </div>
            <p className="mt-2 text-gray-400">
              Créez et modifiez les entraînements
            </p>
          </Link>

          <Link
            to="/admin/settings"
            className="p-6 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Settings className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-white">
                Paramètres du site
              </h3>
            </div>
            <p className="mt-2 text-gray-400">
              Configurez les paramètres du site
            </p>
          </Link>
        </>
      )}
    </div>
  );
}