import { useState } from "react";
import { TrainingList } from "./TrainingList";
import { TrainingForm } from "./TrainingForm";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];

export function TrainingManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

  const handleEdit = (training: Training) => {
    console.log("Opening edit form for training:", training);
    setEditingTraining(training);
    setShowForm(true);
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
        />
      ) : (
        <TrainingList 
          onAddClick={() => setShowForm(true)} 
          onEditClick={handleEdit}
        />
      )}
    </div>
  );
}