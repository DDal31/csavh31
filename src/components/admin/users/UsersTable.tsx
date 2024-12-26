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