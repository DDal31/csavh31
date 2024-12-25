import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];

export function TrainingList({ onAddClick }: { onAddClick: () => void }) {
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const { data: trainings, isLoading } = useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      console.log("Fetching upcoming trainings...");
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error fetching trainings:", error);
        throw error;
      }

      console.log("Trainings fetched:", data);
      return data as Training[];
    },
  });

  const handleEdit = (trainingId: string) => {
    console.log("Editing training:", trainingId);
    setIsEditing(trainingId);
    // TODO: Implement edit functionality
  };

  if (isLoading) {
    return <div>Chargement des entraînements...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Entraînements à venir</h2>
        <Button onClick={onAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un entraînement
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Horaires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainings && trainings.length > 0 ? (
            trainings.map((training) => (
              <TableRow key={training.id}>
                <TableCell>
                  {format(new Date(training.date), "EEEE d MMMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  {training.type === "other"
                    ? training.other_type_details
                    : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
                </TableCell>
                <TableCell>
                  {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    onClick={() => handleEdit(training.id)}
                  >
                    Modifier
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Aucun entraînement à venir
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}