import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import type { Profile } from "@/types/profile";

interface UserActionsProps {
  user: {
    id: string;
    email: string;
    profile: Profile;
  };
  onDeleteUser: (userId: string) => void;
}

export function UserActions({
  user,
  onDeleteUser,
}: UserActionsProps) {
  const fullName = `${user.profile.first_name} ${user.profile.last_name}`.trim();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            className="hover:bg-red-700 w-full sm:w-auto flex items-center justify-center gap-2"
            aria-label={`Supprimer l'utilisateur ${fullName}`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sm:hidden">Supprimer</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir supprimer {fullName} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={() => onDeleteUser(user.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}