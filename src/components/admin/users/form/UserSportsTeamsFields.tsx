import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useSportsAndTeams } from "@/hooks/useSportsAndTeams";
import type { UseFormReturn } from "react-hook-form";
import type { UserFormData } from "@/types/auth";
import type { SportType, TeamType } from "@/types/profile";

interface UserSportsTeamsFieldsProps {
  form: UseFormReturn<UserFormData>;
  showTeams?: boolean;
}

export const UserSportsTeamsFields = ({ form, showTeams = true }: UserSportsTeamsFieldsProps) => {
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const { sports, teams, isLoadingSports, isLoadingTeams } = useSportsAndTeams(selectedSports);

  const currentSport = form.watch("sport");

  useEffect(() => {
    if (sports?.length && currentSport) {
      const sport = sports.find(s => s.name.toLowerCase() === currentSport);
      if (sport) {
        setSelectedSports([sport.id]);
      }
    }
  }, [sports, currentSport]);

  const handleSportChange = (sportId: string, checked: boolean) => {
    const newSelectedSports = checked
      ? [...selectedSports, sportId]
      : selectedSports.filter(id => id !== sportId);
    
    setSelectedSports(newSelectedSports);

    // Convert sport name to SportType
    const getSportType = (sportName: string): SportType => {
      const name = sportName.toLowerCase();
      if (name === "goalball") return "goalball";
      if (name === "torball") return "torball";
      return "both";
    };

    // Update form value based on selected sports
    if (newSelectedSports.length === 0) {
      form.setValue("sport", "goalball");
    } else if (newSelectedSports.length === 1) {
      const sport = sports?.find(s => s.id === newSelectedSports[0]);
      form.setValue("sport", getSportType(sport?.name || "goalball"));
    } else {
      form.setValue("sport", "both");
    }
  };

  // Convert team name to TeamType
  const getTeamType = (teamName: string): TeamType => {
    const name = teamName.toLowerCase().replace(/ /g, "_");
    if (name === "loisir") return "loisir";
    if (name === "d1_masculine") return "d1_masculine";
    return "d1_feminine";
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
                        checked={field.value === getTeamType(team.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            form.setValue("team", getTeamType(team.name));
                          }
                        }}
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