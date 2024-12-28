import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useSportsAndTeams } from "@/hooks/useSportsAndTeams";
import type { UseFormReturn } from "react-hook-form";
import type { UserFormData } from "@/types/auth";

interface UserSportsTeamsFieldsProps {
  form: UseFormReturn<UserFormData>;
  showTeams?: boolean;
}

export const UserSportsTeamsFields = ({ form, showTeams = true }: UserSportsTeamsFieldsProps) => {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const { sports, teams, isLoadingSports, isLoadingTeams } = useSportsAndTeams(selectedSports);

  const currentSport = form.watch("sport");
  const currentTeams = form.watch("team")?.split(", ") || [];

  useEffect(() => {
    if (sports?.length && currentSport) {
      const sport = sports.find(s => s.name.toLowerCase() === currentSport.toLowerCase());
      if (sport) {
        setSelectedSports([sport.id]);
      }
    }
  }, [sports, currentSport]);

  useEffect(() => {
    if (currentTeams.length > 0) {
      setSelectedTeams(currentTeams);
    }
  }, []);

  const handleSportChange = (sportId: string, checked: boolean) => {
    const newSelectedSports = checked
      ? [...selectedSports, sportId]
      : selectedSports.filter(id => id !== sportId);
    
    setSelectedSports(newSelectedSports);

    if (newSelectedSports.length === 0) {
      form.setValue("sport", "");
      form.setValue("team", "");
      setSelectedTeams([]);
    } else if (newSelectedSports.length === 1) {
      const sport = sports?.find(s => s.id === newSelectedSports[0]);
      form.setValue("sport", sport?.name || "");
    } else {
      const sportNames = sports
        ?.filter(s => newSelectedSports.includes(s.id))
        .map(s => s.name)
        .join(", ");
      form.setValue("sport", sportNames);
    }
  };

  const handleTeamChange = (teamName: string, checked: boolean) => {
    const newSelectedTeams = checked
      ? [...selectedTeams, teamName]
      : selectedTeams.filter(name => name !== teamName);
    
    setSelectedTeams(newSelectedTeams);
    form.setValue("team", newSelectedTeams.join(", "));
  };

  if (isLoadingSports) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="sport"
        render={() => (
          <FormItem>
            <FormLabel className="text-gray-300">Sports pratiqués</FormLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {sports?.map((sport) => (
                <div key={sport.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport.id}`}
                    checked={selectedSports.includes(sport.id)}
                    onCheckedChange={(checked) => handleSportChange(sport.id, checked as boolean)}
                    className="border-gray-600 data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor={`sport-${sport.id}`}
                    className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {sport.name}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage className="text-red-400" />
          </FormItem>
        )}
      />

      {showTeams && (form.watch("club_role") === "joueur" || form.watch("club_role") === "joueur-entraineur") && (
        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Équipes</FormLabel>
              {isLoadingTeams ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : teams?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`team-${team.id}`}
                        checked={selectedTeams.includes(team.name)}
                        onCheckedChange={(checked) => handleTeamChange(team.name, checked as boolean)}
                        className="border-gray-600 data-[state=checked]:bg-primary"
                      />
                      <label
                        htmlFor={`team-${team.id}`}
                        className="text-sm font-medium leading-none text-gray-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {team.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aucune équipe disponible pour les sports sélectionnés</p>
              )}
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};