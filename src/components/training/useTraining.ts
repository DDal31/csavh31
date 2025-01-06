import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Training } from "@/types/training";

export function useTraining(trainingId: string | undefined) {
  const [training, setTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTraining = async () => {
      if (!trainingId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("trainings")
          .select(`
            *,
            registrations (
              id,
              user_id,
              created_at,
              training_id,
              profiles (
                first_name,
                last_name,
                club_role
              )
            )
          `)
          .eq("id", trainingId)
          .single();

        if (error) throw error;

        console.log("Fetched training:", data);
        setTraining(data as Training);
      } catch (error) {
        console.error("Error fetching training:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'entraînement",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTraining();
  }, [trainingId, toast]);

  return { training, isLoading };
}