import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerRefereePanel } from "@/components/admin/training/PlayerRefereePanel";
import { UserPlus, PencilIcon, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { Training } from "@/types/training";

type TrainingListProps = {
  trainings: Training[];
  onAddClick?: () => void;
  onEditClick?: (training: Training) => void;
  selectedTrainings?: string[];
  onTrainingToggle?: (trainingId: string) => void;
};

export function TrainingList({ 
  trainings, 
  onAddClick, 
  onEditClick,
  selectedTrainings = [],
  onTrainingToggle 
}: TrainingListProps) {
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

  const isPastTraining = (date: string) => {
    return isBefore(new Date(date), startOfDay(new Date()));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(147, 51, 234, 0)",
              "0 0 0 10px rgba(147, 51, 234, 0.1)",
              "0 0 0 20px rgba(147, 51, 234, 0)",
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Button onClick={onAddClick} className="bg-purple-600 hover:bg-purple-700 relative">
            <motion.span
              className="absolute inset-0 bg-white/20 rounded-lg"
              animate={{
                opacity: [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            Ajouter un entraînement
          </Button>
        </motion.div>
      </div>

      <motion.div 
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {trainings.map((training, index) => {
          const isPast = isPastTraining(training.date);
          
          return (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
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
            </motion.div>
          );
        })}
      </motion.div>

      <PlayerRefereePanel
        training={selectedTraining}
        isOpen={!!selectedTraining}
        onClose={() => setSelectedTraining(null)}
      />
    </div>
  );
}