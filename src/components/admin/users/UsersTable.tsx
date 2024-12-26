import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActions } from "./UserActions";
import type { Profile } from "@/types/profile";

interface User {
  id: string;
  email: string;
  profile: Profile;
}

interface UsersTableProps {
  users: User[];
  onUpdateProfile: (data: Profile) => void;
  onDeleteUser: (userId: string) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
}

export function UsersTable({
  users,
  onUpdateProfile,
  onDeleteUser,
  selectedUser,
  setSelectedUser,
  isEditDialogOpen,
  setIsEditDialogOpen
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-gray-700">
          <TableHead className="text-gray-300 hidden md:table-cell">Email</TableHead>
          <TableHead className="text-gray-300 hidden sm:table-cell">Prénom</TableHead>
          <TableHead className="text-gray-300 hidden sm:table-cell">Nom</TableHead>
          <TableHead className="text-gray-300 hidden lg:table-cell">Rôle Club</TableHead>
          <TableHead className="text-gray-300 hidden lg:table-cell">Sport</TableHead>
          <TableHead className="text-gray-300 hidden lg:table-cell">Équipe</TableHead>
          <TableHead className="text-gray-300 hidden md:table-cell">Rôle Site</TableHead>
          <TableHead className="text-gray-300">Informations</TableHead>
          <TableHead className="text-gray-300">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="border-gray-700">
            <TableCell className="text-gray-300 hidden md:table-cell">{user.email}</TableCell>
            <TableCell className="text-gray-300 hidden sm:table-cell">{user.profile?.first_name}</TableCell>
            <TableCell className="text-gray-300 hidden sm:table-cell">{user.profile?.last_name}</TableCell>
            <TableCell className="text-gray-300 hidden lg:table-cell">{user.profile?.club_role}</TableCell>
            <TableCell className="text-gray-300 hidden lg:table-cell">{user.profile?.sport}</TableCell>
            <TableCell className="text-gray-300 hidden lg:table-cell">{user.profile?.team}</TableCell>
            <TableCell className="text-gray-300 hidden md:table-cell">{user.profile?.site_role}</TableCell>
            <TableCell className="text-gray-300 md:hidden">
              <div className="space-y-1">
                <p className="font-medium">{user.email}</p>
                <p>{user.profile?.first_name} {user.profile?.last_name}</p>
                <p className="text-sm text-gray-400">
                  {user.profile?.club_role} - {user.profile?.sport} - {user.profile?.team}
                </p>
                <p className="text-sm text-gray-400">Rôle: {user.profile?.site_role}</p>
              </div>
            </TableCell>
            <TableCell>
              <UserActions
                user={user}
                onUpdateProfile={onUpdateProfile}
                onDeleteUser={onDeleteUser}
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}