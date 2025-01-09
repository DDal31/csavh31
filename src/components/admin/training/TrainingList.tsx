import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import type { Training } from "@/types/training";

type Props = {
  trainings: Training[];
  onEditClick: (training: Training) => void;
  onDeleteClick: (training: Training) => void;
};

export function TrainingList({ trainings, onEditClick, onDeleteClick }: Props) {
  return (
    <div className="space-y-4">
      {trainings.map((training) => (
        <Card key={training.id} className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-xl font-bold text-white">
              {training.type === 'other' 
                ? training.other_type_details || 'Événement' 
                : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEditClick(training)}
                className="text-white hover:bg-gray-600"
                aria-label="Modifier l'entraînement"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onDeleteClick(training)}
                className="text-white hover:bg-gray-600"
                aria-label="Supprimer l'entraînement"
              >
                <Trash2 className="h-5 w-5" />
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}