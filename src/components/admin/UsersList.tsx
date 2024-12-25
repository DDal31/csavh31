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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Rôle Club</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Équipe</TableHead>
            <TableHead>Rôle Site</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.profile?.first_name}</TableCell>
              <TableCell>{user.profile?.last_name}</TableCell>
              <TableCell>{user.profile?.club_role}</TableCell>
              <TableCell>{user.profile?.sport}</TableCell>
              <TableCell>{user.profile?.team}</TableCell>
              <TableCell>{user.profile?.site_role}</TableCell>
              <TableCell>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier le profil</DialogTitle>
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