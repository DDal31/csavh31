import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSportsAndTeams = (selectedSports: string[] = []) => {
  const { data: sports, isLoading: isLoadingSports } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      console.log("Fetching sports...");
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching sports:", error);
        throw error;
      }

      console.log("Sports fetched:", data);
      return data;
    },
  });

  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ["teams", selectedSports],
    queryFn: async () => {
      if (!selectedSports.length) return [];

      console.log("Fetching teams for sports:", selectedSports);
      const { data, error } = await supabase
        .from("teams")
        .select("*, sports!inner(*)")
        .in("sport_id", selectedSports)
        .order("name");

      if (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }

      console.log("Teams fetched:", data);
      return data;
    },
    enabled: selectedSports.length > 0,
  });

  return {
    sports,
    teams,
    isLoadingSports,
    isLoadingTeams,
  };
};