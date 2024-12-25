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
    return <div className="text-white">Chargement des entraînements...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Entraînements à venir
        </h2>
        <Button 
          onClick={onAddClick} 
          className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un entraînement
        </Button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="text-[#9b87f5]">Date</TableHead>
              <TableHead className="text-[#9b87f5]">Type</TableHead>
              <TableHead className="text-[#9b87f5]">Horaires</TableHead>
              <TableHead className="text-right text-[#9b87f5]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings && trainings.length > 0 ? (
              trainings.map((training) => (
                <TableRow key={training.id} className="hover:bg-white/5">
                  <TableCell className="text-gray-200">
                    {format(new Date(training.date), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {training.type === "other"
                      ? training.other_type_details
                      : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(training.id)}
                      className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white"
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400">
                  Aucun entraînement à venir
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}