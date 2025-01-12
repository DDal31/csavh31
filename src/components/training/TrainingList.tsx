import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, PencilIcon, Trash2, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TrainingListProps {
  trainings: any[];
  onAddClick: () => void;
  onEditClick: (training: any) => void;
}

export function TrainingList({ trainings, onAddClick, onEditClick }: TrainingListProps) {
  const [selectedTraining, setSelectedTraining] = useState(null);

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
              "0 0 0 20px rgba(147, 51, 234, 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Button
            onClick={onAddClick}
            className="bg-purple-600 hover:bg-purple-700 relative"
          >
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
              <Card className={cn("bg-gray-800", { "opacity-50": isPast })}>
                <CardHeader>
                  <CardTitle>{training.title}</CardTitle>
                  <p className="text-sm text-gray-400">
                    {formatTrainingDate(training.date)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarFallback>{training.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="ml-2">{training.coach}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => onEditClick(training)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
