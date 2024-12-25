import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useTrainingRegistration() {
  const { toast } = useToast();

  const handleSaveRegistrations = async (selectedTrainings: string[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      // Get current registrations
      const { data: currentRegistrations } = await supabase
        .from("registrations")
        .select("training_id")
        .eq("user_id", session.user.id);

      const currentRegistrationIds = currentRegistrations?.map(reg => reg.training_id) || [];

      // Trainings to add (selected but not currently registered)
      const trainingsToAdd = selectedTrainings.filter(
        trainingId => !currentRegistrationIds.includes(trainingId)
      );

      // Trainings to remove (currently registered but not selected)
      const trainingsToRemove = currentRegistrationIds.filter(
        trainingId => !selectedTrainings.includes(trainingId)
      );

      // Add new registrations
      if (trainingsToAdd.length > 0) {
        const registrationsToInsert = trainingsToAdd.map(trainingId => ({
          training_id: trainingId,
          user_id: session.user.id
        }));

        const { error: insertError } = await supabase
          .from("registrations")
          .insert(registrationsToInsert);

        if (insertError) throw insertError;
      }

      // Remove old registrations
      if (trainingsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("registrations")
          .delete()
          .eq("user_id", session.user.id)
          .in("training_id", trainingsToRemove);

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Succès",
        description: "Vos inscriptions ont été mises à jour",
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des inscriptions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos inscriptions",
        variant: "destructive"
      });
    }
  };

  return { handleSaveRegistrations };
}