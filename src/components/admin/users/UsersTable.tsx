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
  profile?: Profile;
}

interface UsersTableProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({
  users,
  onDeleteUser,
}: UsersTableProps) {
  return (
    <div role="region" aria-label="Liste des utilisateurs">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700">
            <TableHead className="text-gray-300 hidden md:table-cell" scope="col">Email</TableHead>
            <TableHead className="text-gray-300 hidden sm:table-cell" scope="col">Prénom</TableHead>
            <TableHead className="text-gray-300 hidden sm:table-cell" scope="col">Nom</TableHead>
            <TableHead className="text-gray-300 hidden lg:table-cell" scope="col">Rôle Club</TableHead>
            <TableHead className="text-gray-300 hidden lg:table-cell" scope="col">Sport</TableHead>
            <TableHead className="text-gray-300 hidden lg:table-cell" scope="col">Équipe</TableHead>
            <TableHead className="text-gray-300 hidden md:table-cell" scope="col">Rôle Site</TableHead>
            <TableHead className="text-gray-300" scope="col">Informations</TableHead>
            <TableHead className="text-gray-300" scope="col">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="border-gray-700">
              <TableCell className="text-gray-300 hidden md:table-cell">{user.email}</TableCell>
              <TableCell className="text-gray-300 hidden sm:table-cell">{user.profile?.first_name || '-'}</TableCell>
              <TableCell className="text-gray-300 hidden sm:table-cell">{user.profile?.last_name || '-'}</TableCell>
              <TableCell className="text-gray-300 hidden lg:table-cell">{user.profile?.club_role || '-'}</TableCell>
              <TableCell className="text-gray-300 hidden lg:table-cell">{user.profile?.sport || '-'}</TableCell>
              <TableCell className="text-gray-300 hidden lg:table-cell">{user.profile?.team || '-'}</TableCell>
              <TableCell className="text-gray-300 hidden md:table-cell">{user.profile?.site_role || '-'}</TableCell>
              <TableCell className="text-gray-300 md:hidden">
                <div className="space-y-1" role="region" aria-label={`Informations de ${user.profile?.first_name || user.email}`}>
                  <p className="font-medium">Email: {user.email}</p>
                  <p>Nom complet: {user.profile ? `${user.profile.first_name} ${user.profile.last_name}` : '-'}</p>
                  <p className="text-sm text-gray-400">
                    Rôle club: {user.profile?.club_role || '-'} - Sport: {user.profile?.sport || '-'} - Équipe: {user.profile?.team || '-'}
                  </p>
                  <p className="text-sm text-gray-400">Rôle site: {user.profile?.site_role || '-'}</p>
                </div>
              </TableCell>
              <TableCell>
                <UserActions
                  user={user}
                  onDeleteUser={onDeleteUser}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}