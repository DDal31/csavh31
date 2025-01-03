import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  targetGroup: string;
  setTargetGroup: (value: string) => void;
  selectedSport: string;
  setSelectedSport: (value: string) => void;
  sports?: { id: string; name: string; }[];
}

export function NotificationFormFields({
  title,
  setTitle,
  content,
  setContent,
  targetGroup,
  setTargetGroup,
  selectedSport,
  setSelectedSport,
  sports,
}: NotificationFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-200">
          Titre de la notification
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
          placeholder="Entrez le titre"
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-200">
          Contenu de la notification
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1"
          placeholder="Entrez le contenu de la notification"
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="target-group" className="block text-sm font-medium text-gray-200">
          Groupe cible
        </label>
        <Select
          value={targetGroup}
          onValueChange={(value) => {
            setTargetGroup(value);
            if (value !== "sport_specific") {
              setSelectedSport("");
            }
          }}
        >
          <SelectTrigger id="target-group" className="mt-1">
            <SelectValue placeholder="Sélectionnez le groupe cible" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            <SelectItem value="sport_specific">Sport spécifique</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {targetGroup === "sport_specific" && (
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-gray-200">
            Sport
          </label>
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger id="sport" className="mt-1">
              <SelectValue placeholder="Sélectionnez un sport" />
            </SelectTrigger>
            <SelectContent>
              {sports?.map((sport) => (
                <SelectItem key={sport.id} value={sport.name}>
                  {sport.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}