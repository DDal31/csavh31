
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrainingList } from "./TrainingList";
import { TrainingForm } from "./TrainingForm";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Training } from "@/types/training";
import { useToast } from "@/components/ui/use-toast";

type DbTraining = Database["public"]["Tables"]["trainings"]["Row"];

export function TrainingManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<DbTraining | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      console.log("Fetching trainings...");
      const { data, error } = await supabase
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
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching trainings:", error);
        throw error;
      }

      console.log("Trainings fetched:", data);
      return data as Training[];
    },
  });

  const handleEdit = (training: DbTraining) => {
    console.log("Opening edit form for training:", training);
    setEditingTraining(training);
    setShowForm(true);
  };

  const handleDelete = async (training: Training) => {
    try {
      console.log("Deleting training:", training);
      
      // Delete all registrations for this training first
      const { error: registrationsError } = await supabase
        .from("registrations")
        .delete()
        .eq("training_id", training.id);
        
      if (registrationsError) {
        throw registrationsError;
      }
      
      // Then delete the training
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", training.id);
        
      if (error) {
        throw error;
      }
      
      // Invalidate the query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      
      toast({
        title: "Entraînement supprimé",
        description: "L'entraînement a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Error deleting training:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'entraînement.",
      });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTraining(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {showForm ? (
        <TrainingForm
          training={editingTraining}
          onSuccess={handleClose}
          onCancel={handleClose}
          isAdmin={true}
        />
      ) : (
        <TrainingList 
          trainings={trainings}
          onAddClick={() => setShowForm(true)} 
          onEditClick={handleEdit}
          onDeleteClick={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
