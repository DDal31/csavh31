import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Training } from "@/types/training";

export interface TrainingListProps {
  trainings: Training[];
  onEditClick: (training: Training) => void;
  onAddClick: () => void;
}

export function TrainingList({ trainings, onEditClick, onAddClick }: TrainingListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Liste des entraînements</h2>
        <Button onClick={onAddClick} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="h-5 w-5 mr-2" />
          Ajouter un entraînement
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((training) => (
          <div
            key={training.id}
            className="bg-gray-800 p-4 rounded-lg shadow hover:bg-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white capitalize">
                  {training.type === "other" 
                    ? training.other_type_details 
                    : training.type}
                </h3>
                <p className="text-gray-400">
                  {format(new Date(training.date), "EEEE d MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-400">
              <p>
                De {training.start_time} à {training.end_time}
              </p>
              <p>
                {training.registrations?.length || 0} participant
                {(training.registrations?.length || 0) > 1 ? "s" : ""}
              </p>
            </div>

            <Button
              onClick={() => onEditClick(training)}
              variant="outline"
              className="mt-4 w-full"
            >
              Modifier
            </Button>
          </div>
        ))}
      </div>

      {trainings.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Aucun entraînement n'a été créé
        </div>
      )}
    </div>
  );
}