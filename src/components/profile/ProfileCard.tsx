import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/profile";

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-white">Informations personnelles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-white">
          <div>
            <p className="font-medium">Nom complet</p>
            <p>{profile.first_name} {profile.last_name}</p>
          </div>
          <div>
            <p className="font-medium">Email</p>
            <p>{profile.email}</p>
          </div>
          {profile.phone && (
            <div>
              <p className="font-medium">Téléphone</p>
              <p>{profile.phone}</p>
            </div>
          )}
          <div>
            <p className="font-medium">Rôle dans le club</p>
            <p>{profile.club_role}</p>
          </div>
          <div>
            <p className="font-medium">Sport</p>
            <p>{profile.sport}</p>
          </div>
          <div>
            <p className="font-medium">Équipe</p>
            <p>{profile.team}</p>
          </div>
          <div>
            <p className="font-medium">Rôle sur le site</p>
            <p>{profile.site_role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}