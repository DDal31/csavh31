
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrainingList } from "./TrainingList";
import { TrainingForm } from "./TrainingForm";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Training } from "@/types/training";

type DbTraining = Database["public"]["Tables"]["trainings"]["Row"];

export function TrainingManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<DbTraining | null>(null);

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

  const handleClose = () => {
    setShowForm(false);
    setEditingTraining(null);
  };

  if (isLoading) {
    return <div className="text-center text-gray-400">Chargement des entraînements...</div>;
  }

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
        />
      )}
    </div>
  );
}
