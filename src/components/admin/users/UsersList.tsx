
import { UsersTable } from "./UsersTable";
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
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <UsersTable
        users={users}
        onDeleteUser={onDeleteUser}
      />
    </div>
  );
};

export default UsersList;
