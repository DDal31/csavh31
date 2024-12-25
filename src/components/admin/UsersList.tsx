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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProfileEditForm from "@/components/ProfileEditForm";
import type { Profile } from "@/types/profile";

interface User {
  id: string;
  email: string;
  profile: Profile;
}

interface UsersListProps {
  users: User[];
  onUpdateProfile: (data: Profile) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
}

const UsersList = ({
  users,
  onUpdateProfile,
  selectedUser,
  setSelectedUser,
  isEditDialogOpen,
  setIsEditDialogOpen
}: UsersListProps) => {
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
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                      onClick={() => setSelectedUser(user)}
                    >
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Modifier le profil</DialogTitle>
                    </DialogHeader>
                    {selectedUser && (
                      <ProfileEditForm
                        profile={selectedUser.profile}
                        onSubmit={onUpdateProfile}
                        isLoading={false}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersList;