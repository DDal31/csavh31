import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Training } from "@/types/training";

interface TrainingListProps {
  trainings: Training[];
  onAddClick: () => void;
  onEditClick: (training: Training) => void;
}

export function TrainingList({ trainings, onAddClick, onEditClick }: TrainingListProps) {
  const navigate = useNavigate();

  const handleNotificationClick = (training: Training) => {
    navigate(`/admin/trainings/${training.id}/notify`, {
      state: { training }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestion des entraînements</h1>
        <Button 
          onClick={onAddClick}
          className="bg-white/10 hover:bg-white/20 text-white"
          aria-label="Ajouter un entraînement"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {trainings.length === 0 ? (
        <p className="text-center text-gray-400">Aucun entraînement n'a été créé.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {training.type === 'other' 
                      ? training.other_type_details 
                      : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
                  </h3>
                  <p className="text-gray-400">
                    {format(new Date(training.date), "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                  <p className="text-gray-400">
                    {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleNotificationClick(training)}
                    className="text-white hover:text-white hover:bg-white/20"
                    aria-label="Envoyer une notification"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onEditClick(training)}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    Modifier
                  </Button>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-400">
                  {training.registrations?.length || 0} participant(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}