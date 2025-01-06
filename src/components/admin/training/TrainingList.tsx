import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerRefereePanel } from "./PlayerRefereePanel";
import { UserPlus, PencilIcon, Trash2, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Training } from "@/types/training";

type TrainingListProps = {
  trainings: Training[];
  onAddClick: () => void;
  onEditClick: (training: Training) => void;
};

export function TrainingList({ trainings, onAddClick, onEditClick }: TrainingListProps) {
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async (trainingId: string) => {
    try {
      console.log("Deleting training:", trainingId);
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", trainingId);

      if (error) throw error;

      toast({
        title: "Entraînement supprimé",
        description: "L'entraînement a été supprimé avec succès.",
      });

      // Reload the page to refresh the list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting training:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'entraînement.",
      });
    }
  };

  const handleNotificationClick = (training: Training) => {
    navigate(`/admin/trainings/${training.id}/notify`, {
      state: { training }
    });
  };

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
          <UserPlus className="w-4 h-4 mr-2" />
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
                  onClick={() => handleNotificationClick(training)}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  aria-label="Envoyer une notification pour cet entraînement"
                >
                  <Bell className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedTraining(training)}
                  className="text-white hover:bg-gray-600"
                  aria-label={`Ajouter joueur/arbitre pour l'entraînement du ${formatTrainingDate(training.date)}`}
                >
                  <UserPlus className="w-5 h-5" />
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      aria-label={`Supprimer l'entraînement du ${formatTrainingDate(training.date)}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Cela supprimera définitivement l'entraînement
                        du {formatTrainingDate(training.date)} et toutes les inscriptions associées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(training.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                  <p className="text-sm">
                    {training.registrations.length} participant{training.registrations.length > 1 ? 's' : ''} inscrit{training.registrations.length > 1 ? 's' : ''}
                  </p>
                )}
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