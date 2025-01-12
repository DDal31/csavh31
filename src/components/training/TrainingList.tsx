import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfetti } from "@/hooks/useConfetti";
import type { Training } from "@/types/training";

type TrainingListProps = {
  trainings: Training[];
  selectedTrainings: string[];
  onTrainingToggle: (trainingId: string) => void;
};

export function TrainingList({ trainings, selectedTrainings, onTrainingToggle }: TrainingListProps) {
  const { triggerConfetti } = useConfetti();
  const [previousSelected, setPreviousSelected] = useState<string[]>([]);

  if (trainings.length === 0) {
    return (
      <div className="text-center text-gray-400">
        Aucun entraînement disponible pour le moment.
      </div>
    );
  }

  const handleTrainingToggle = (trainingId: string) => {
    const wasSelected = selectedTrainings.includes(trainingId);
    const willBeSelected = !wasSelected;
    
    if (willBeSelected && !previousSelected.includes(trainingId)) {
      triggerConfetti();
      setPreviousSelected(prev => [...prev, trainingId]);
    }
    
    onTrainingToggle(trainingId);
  };

  return (
    <div className="space-y-6">
      {trainings.map((training) => (
        <Card 
          key={training.id} 
          className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold text-white">
              {training.type === 'other' 
                ? training.other_type_details || 'Événement' 
                : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
            </CardTitle>
            <div className="flex items-center gap-4">
              {selectedTrainings.includes(training.id) && (
                <span className="text-green-400 text-sm" aria-label="Vous êtes déjà inscrit à cet entraînement">
                  Déjà inscrit
                </span>
              )}
              <Checkbox 
                checked={selectedTrainings.includes(training.id)}
                onCheckedChange={() => handleTrainingToggle(training.id)}
                className="border-gray-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500"
                aria-label={`S'inscrire à l'entraînement du ${format(new Date(training.date), "EEEE d MMMM yyyy", { locale: fr })}`}
              />
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}