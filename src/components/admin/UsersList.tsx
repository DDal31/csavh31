import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useNavigate } from "react-router-dom";
import type { Profile } from "@/types/profile";

interface User {
  id: string;
  email: string;
  profile: Profile;
}

interface UsersListProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
}

const UsersList = ({
  users,
  onDeleteUser,
}: UsersListProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-300">Email</TableHead>
            <TableHead className="text-gray-300">Prénom</TableHead>
            <TableHead className="text-gray-300">Nom</TableHead>
            <TableHead className="text-gray-300">Rôle Club</TableHead>
            <TableHead className="text-gray-300">Sport</TableHead>
            <TableHead className="text-gray-300">Équipe</TableHead>
            <TableHead className="text-gray-300">Rôle Site</TableHead>
            <TableHead className="text-gray-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-gray-700">
              <TableCell className="text-gray-300">{user.email}</TableCell>
              <TableCell className="text-gray-300">{user.profile?.first_name}</TableCell>
              <TableCell className="text-gray-300">{user.profile?.last_name}</TableCell>
              <TableCell className="text-gray-300">{user.profile?.club_role}</TableCell>
              <TableCell className="text-gray-300">{user.profile?.sport}</TableCell>
              <TableCell className="text-gray-300">{user.profile?.team}</TableCell>
              <TableCell className="text-gray-300">{user.profile?.site_role}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                    onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    aria-label={`Modifier le profil de ${user.profile?.first_name} ${user.profile?.last_name}`}
                  >
                    Modifier
                  </Button>

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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersList;