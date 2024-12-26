import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ArrowLeft, Trash2 } from "lucide-react";
import ProfileEditForm from "@/components/ProfileEditForm";
import type { Profile } from "@/types/profile";

interface UserActionsProps {
  user: {
    id: string;
    email: string;
    profile: Profile;
  };
  onUpdateProfile: (data: Profile) => void;
  onDeleteUser: (userId: string) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
}

export function UserActions({
  user,
  onUpdateProfile,
  onDeleteUser,
  isEditDialogOpen,
  setIsEditDialogOpen,
}: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white border-none"
          >
            Modifier
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="text-white w-fit flex items-center gap-2 hover:text-gray-300"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <DialogTitle className="text-white">Modifier le profil</DialogTitle>
            </div>
          </DialogHeader>
          <ProfileEditForm
            profile={user.profile}
            onSubmit={onUpdateProfile}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
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