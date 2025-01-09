import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PencilIcon, Trash2 } from "lucide-react";
import type { Training } from "@/types/training";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TrainingListProps = {
  trainings: Training[];
  onAddClick: () => void;
  onEditClick: (training: Training) => void;
};

export function TrainingList({ trainings, onAddClick, onEditClick }: TrainingListProps) {
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditClick(training)}
                  className="text-white hover:bg-gray-600"
                  aria-label={`Modifier l'entraînement du ${formatTrainingDate(training.date)}`}
                >
                  <PencilIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  aria-label={`Supprimer l'entraînement du ${formatTrainingDate(training.date)}`}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
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
                  <div className="flex items-center space-x-2 mt-2">
                    <p>
                      {training.registrations.length} participant{training.registrations.length > 1 ? 's' : ''} inscrit{training.registrations.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex -space-x-2">
                      {training.registrations.slice(0, 3).map((registration) => (
                        <Avatar key={registration.user_id} className="w-6 h-6 border-2 border-gray-800">
                          <AvatarFallback className="text-xs">
                            {registration.profiles.first_name[0]}{registration.profiles.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {training.registrations.length > 3 && (
                        <Avatar className="w-6 h-6 border-2 border-gray-800 bg-gray-700">
                          <AvatarFallback className="text-xs">
                            +{training.registrations.length - 3}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}