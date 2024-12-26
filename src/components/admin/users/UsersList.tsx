import { UsersTable } from "./UsersTable";
import type { Profile } from "@/types/profile";

interface User {
  id: string;
  email: string;
  profile: Profile;
}

interface UsersListProps {
  users: User[];
  onUpdateProfile: (data: Profile) => void;
  onDeleteUser: (userId: string) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
}

const UsersList = ({
  users,
  onUpdateProfile,
  onDeleteUser,
  selectedUser,
  setSelectedUser,
  isEditDialogOpen,
  setIsEditDialogOpen
}: UsersListProps) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <UsersTable
        users={users}
        onUpdateProfile={onUpdateProfile}
        onDeleteUser={onDeleteUser}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
      />
    </div>
  );
};

export default UsersList;