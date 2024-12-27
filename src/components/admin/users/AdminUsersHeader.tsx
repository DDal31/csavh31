import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdminUsersHeaderProps {
  onNewUser: () => void;
}

export const AdminUsersHeader = ({ onNewUser }: AdminUsersHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <Button 
        variant="ghost" 
        className="text-white w-fit flex items-center gap-2 hover:text-gray-300"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl font-bold text-white">
          Gestion des Utilisateurs
        </h1>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
          onClick={onNewUser}
        >
          <UserPlus className="w-4 h-4" />
          Nouvel Utilisateur
        </Button>
      </div>
    </div>
  );
};