
import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerRefereePanel } from "./PlayerRefereePanel";
import { UserPlus, PencilIcon, Trash2, Clock } from "lucide-react";
import type { Training } from "@/types/training";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TrainingListProps = {
  trainings: Training[];
  onAddClick: () => void;
  onEditClick: (training: Training) => void;
  onDeleteClick: (training: Training) => void;
};

export function TrainingList({ trainings, onAddClick, onEditClick, onDeleteClick }: TrainingListProps) {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);

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

  const isPastTraining = (date: string) => {
    return isBefore(new Date(date), startOfDay(new Date()));
  };

  const handleDeleteClick = (training: Training) => {
    setTrainingToDelete(training);
  };

  const confirmDelete = () => {
    if (trainingToDelete) {
      onDeleteClick(trainingToDelete);
      setTrainingToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onAddClick} className="bg-purple-600 hover:bg-purple-700">
          Ajouter un entraînement
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((training) => {
          const isPast = isPastTraining(training.date);
          
          return (
            <Card 
              key={training.id} 
              className={cn(
                "border-gray-700 transition-colors",
                isPast ? "bg-gray-900 opacity-75" : "bg-gray-800 hover:bg-gray-700"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-bold text-white">
                    {training.type === 'other' 
                      ? training.other_type_details || 'Événement' 
                      : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
                  </CardTitle>
                  {isPast && (
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Passé</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTraining(training)}
                    className="text-white hover:bg-gray-600 relative"
                    aria-label={`Ajouter/retirer des joueurs et arbitres pour l'entraînement de ${training.type} du ${formatTrainingDate(training.date)}`}
                  >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-purple-600 text-white text-xs">
                          P
                        </AvatarFallback>
                      </Avatar>
                      <UserPlus className="w-3 h-3 absolute -bottom-1 -right-1 text-white bg-purple-600 rounded-full p-[1px]" />
                    </div>
                  </Button>
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
                    onClick={() => handleDeleteClick(training)}
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
          );
        })}
      </div>

      <PlayerRefereePanel
        training={selectedTraining}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
      />

      <AlertDialog open={!!trainingToDelete} onOpenChange={(open) => !open && setTrainingToDelete(null)}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Êtes-vous sûr de vouloir supprimer cet entraînement
              {trainingToDelete && (
                <span>
                  {' '}de {trainingToDelete.type === 'other' 
                    ? trainingToDelete.other_type_details || 'Événement' 
                    : trainingToDelete.type.charAt(0).toUpperCase() + trainingToDelete.type.slice(1)} 
                  le {formatTrainingDate(trainingToDelete.date)}
                </span>
              )}
              ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
