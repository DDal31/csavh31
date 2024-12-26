import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Training = Database["public"]["Tables"]["trainings"]["Row"];

type TrainingListProps = {
  onAddClick: () => void;
  onEditClick: (training: Training) => void;
};

export function TrainingList({ onAddClick, onEditClick }: TrainingListProps) {
  const { toast } = useToast();
  const { data: trainings, isLoading, refetch } = useQuery({
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

  const handleDelete = async (trainingId: string) => {
    try {
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", trainingId);

      if (error) throw error;

      toast({
        title: "Entraînement supprimé",
        description: "L'entraînement a été supprimé avec succès.",
      });

      refetch();
    } catch (error) {
      console.error("Error deleting training:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'entraînement.",
      });
    }
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
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => onEditClick(training)}
                      className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white"
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(training.id)}
                      className="bg-red-600 hover:bg-red-700"
                      aria-label={`Supprimer l'entraînement du ${format(new Date(training.date), "EEEE d MMMM yyyy", {
                        locale: fr,
                      })}`}
                    >
                      <Trash2 className="h-4 w-4" />
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