

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
import { PasswordChangeDialog } from "./PasswordChangeDialog";
import { UserActions } from "./UserActions";
import type { Profile } from "@/types/profile";

interface User {
  id: string;
  email: string;
  profile: Profile;
}

interface UsersTableProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({ users, onDeleteUser }: UsersTableProps) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      {/* Vue mobile - cartes empilées */}
      <div className="block sm:hidden">
        {users.map((user) => (
          <div key={user.id} className="border-b border-gray-700 p-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-white font-medium">
                  {user.profile?.first_name} {user.profile?.last_name}
                </h3>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Rôle Club:</span>
                  <p className="text-gray-300">{user.profile?.club_role}</p>
                </div>
                <div>
                  <span className="text-gray-400">Sport:</span>
                  <p className="text-gray-300">{user.profile?.sport}</p>
                </div>
                <div>
                  <span className="text-gray-400">Équipe:</span>
                  <p className="text-gray-300">{user.profile?.team}</p>
                </div>
                <div>
                  <span className="text-gray-400">Rôle Site:</span>
                  <p className="text-gray-300">{user.profile?.site_role}</p>
                </div>
              </div>

              <div className="pt-2">
                <UserActions user={user} onDeleteUser={onDeleteUser} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vue desktop - tableau */}
      <div className="hidden sm:block">
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

                    <PasswordChangeDialog
                      userId={user.id}
                      userName={`${user.profile?.first_name} ${user.profile?.last_name}`}
                    />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="hover:bg-red-700"
                          aria-label={`Supprimer l'utilisateur ${user.profile?.first_name} ${user.profile?.last_name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-800 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Êtes-vous sûr de vouloir supprimer {user.profile?.first_name} {user.profile?.last_name} ? Cette action est irréversible.
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
    </div>
  );
}

