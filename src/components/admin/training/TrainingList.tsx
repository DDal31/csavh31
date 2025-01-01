import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerRefereePanel } from "./PlayerRefereePanel";
import type { Training } from "@/types/training";

type TrainingListProps = {
  trainings: Training[];
  onAddClick: () => void;
  onEditClick: (training: Training) => void;
};

export function TrainingList({ trainings, onAddClick, onEditClick }: TrainingListProps) {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  if (trainings.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-8">
        Aucun entraînement n'a été créé.
        <Button onClick={onAddClick} className="ml-2">
          Créer un entraînement
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={onAddClick} className="w-full mb-6">
        Créer un entraînement
      </Button>

      {trainings.map((training) => (
        <Card key={training.id} className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold text-white">
              {training.type === 'other' 
                ? training.other_type_details || 'Autre' 
                : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTraining(training)}
                className="text-white hover:text-white hover:bg-gray-700"
                aria-label="Ajouter des participants à l'entraînement"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter joueur/arbitre
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditClick(training)}
                className="text-white hover:text-white hover:bg-gray-700"
              >
                Modifier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300">
              <p>
                {format(new Date(training.date), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              <p>
                {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
              </p>
              {training.registrations && training.registrations.length > 0 && (
                <p className="mt-2">
                  {training.registrations.length} participant{training.registrations.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedTraining && (
        <PlayerRefereePanel
          training={selectedTraining}
          isOpen={!!selectedTraining}
          onClose={() => setSelectedTraining(null)}
        />
      )}
    </div>
  );
}