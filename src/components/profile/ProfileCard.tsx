import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileEditForm from "@/components/ProfileEditForm";
import type { Profile } from "@/types/profile";
import type { ProfileFormData } from "@/schemas/profileSchema";

interface ProfileCardProps {
  profile: Profile;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading: boolean;
}

export function ProfileCard({ profile, onSubmit, isLoading }: ProfileCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-white">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileEditForm
          profile={profile}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
}