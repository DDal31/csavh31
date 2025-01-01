import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerRefereePanel } from "./PlayerRefereePanel";
import { Plus, UserPlus, PencilIcon, Trash2 } from "lucide-react";
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
      <div className="text-center text-gray-400">
        Aucun entraînement disponible pour le moment.
      </div>
    );
  }

  const formatTrainingDate = (date: string) => {
    return format(new Date(date), "EEEE d MMMM yyyy", { locale: fr });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onAddClick} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un entraînement
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            </CardHeader>
            <CardContent>
              <div className="text-gray-300 space-y-2">
                <p>
                  {formatTrainingDate(training.date)}
                </p>
                <p>
                  {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
                </p>
                {training.registrations && training.registrations.length > 0 && (
                  <p className="mt-2">
                    {training.registrations.length} participant{training.registrations.length > 1 ? 's' : ''} inscrit{training.registrations.length > 1 ? 's' : ''}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTraining(training)}
                    className="flex items-center gap-2 text-white border-gray-600 hover:bg-gray-600"
                    aria-label={`Ajouter joueur/arbitre pour l'entraînement du ${formatTrainingDate(training.date)}`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Ajouter joueur/arbitre</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditClick(training)}
                    className="text-white hover:bg-gray-600"
                    aria-label={`Modifier l'entraînement du ${formatTrainingDate(training.date)}`}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    aria-label={`Supprimer l'entraînement du ${formatTrainingDate(training.date)}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PlayerRefereePanel
        training={selectedTraining}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
      />
    </div>
  );
}