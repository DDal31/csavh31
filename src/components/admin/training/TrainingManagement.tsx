import { useState } from "react";
import { TrainingList } from "./TrainingList";
import { TrainingForm } from "./TrainingForm";

export function TrainingManagement() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {showForm ? (
        <TrainingForm
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <TrainingList onAddClick={() => setShowForm(true)} />
      )}
    </div>
  );
}