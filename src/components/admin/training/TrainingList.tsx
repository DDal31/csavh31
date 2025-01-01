import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerRefereePanel } from "./PlayerRefereePanel";
import { Plus, Edit } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onAddClick} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un entraînement
        </Button>
      </div>

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTraining(training)}
                className="text-white border-gray-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter joueur/arbitre
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditClick(training)}
                className="text-white hover:text-purple-400"
              >
                <Edit className="w-4 h-4" />
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
                  {training.registrations.length} participant{training.registrations.length > 1 ? 's' : ''} inscrit{training.registrations.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <PlayerRefereePanel
        training={selectedTraining!}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
      />
    </div>
  );
}