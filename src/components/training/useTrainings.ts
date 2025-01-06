import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Training } from "@/types/training";

export function useTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainingsAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Fetch user profile first to get sport preference
        const { data: profile } = await supabase
          .from("profiles")
          .select("sport")
          .eq("id", session.user.id)
          .single();

        console.log("User profile sport:", profile?.sport);
        setUserProfile(profile);

        if (!profile) {
          throw new Error("Profile not found");
        }

        // Parse user sports from profile
        const userSports = profile.sport.split(",").map((s: string) => s.trim().toLowerCase());
        console.log("User sports array:", userSports);

        // Build the type filter based on user's sports
        const typeConditions = userSports.map(sport => {
          if (sport === 'both') {
            return 'type.in.(goalball,torball,other)';
          }
          return `type.eq.${sport}`;
        });
        const typeFilter = typeConditions.join(',');

        // Fetch trainings with registrations and profiles
        const { data: trainingsData, error: trainingsError } = await supabase
          .from("trainings")
          .select(`
            *,
            registrations (
              id,
              user_id,
              created_at,
              profiles (
                first_name,
                last_name,
                club_role
              )
            )
          `)
          .gte("date", new Date().toISOString().split("T")[0])
          .or(typeFilter)
          .order("date", { ascending: true });

        if (trainingsError) throw trainingsError;

        console.log("Fetched trainings:", trainingsData);
        setTrainings(trainingsData as Training[]);

        // Fetch user's current registrations
        const { data: registrations, error: registrationsError } = await supabase
          .from("registrations")
          .select("training_id")
          .eq("user_id", session.user.id);

        if (registrationsError) throw registrationsError;

        setSelectedTrainings(registrations.map(reg => reg.training_id));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchTrainingsAndProfile();
  }, [navigate, toast]);

  return {
    trainings,
    selectedTrainings,
    setSelectedTrainings,
    loading,
    userProfile
  };
}