import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
      <Button 
        onClick={() => navigate('/admin')} 
        variant="ghost" 
        className="text-white hover:text-gray-300 mb-6 w-full sm:w-auto"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour au tableau de bord
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Entraînements à venir
        </h2>
        <Button 
          onClick={onAddClick} 
          className="w-full sm:w-auto bg-[#9b87f5] hover:bg-[#7E69AB] text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un entraînement
        </Button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-2 sm:p-6 shadow-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="text-[#9b87f5] hidden sm:table-cell">Date</TableHead>
              <TableHead className="text-[#9b87f5]">Détails</TableHead>
              <TableHead className="text-[#9b87f5] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings && trainings.length > 0 ? (
              trainings.map((training) => (
                <TableRow key={training.id} className="hover:bg-white/5">
                  <TableCell className="text-gray-200 hidden sm:table-cell">
                    {format(new Date(training.date), "EEEE d MMMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell className="text-gray-200">
                    <div className="flex flex-col gap-1">
                      <span className="sm:hidden font-medium">
                        {format(new Date(training.date), "EEEE d MMMM yyyy", {
                          locale: fr,
                        })}
                      </span>
                      <span className="text-sm sm:text-base">
                        {training.type === "other"
                          ? training.other_type_details
                          : training.type.charAt(0).toUpperCase() + training.type.slice(1)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {training.start_time.slice(0, 5)} - {training.end_time.slice(0, 5)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col sm:flex-row gap-2 justify-end items-stretch sm:items-center">
                      <Button
                        variant="outline"
                        onClick={() => onEditClick(training)}
                        className="border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white w-full sm:w-auto"
                      >
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(training.id)}
                        className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                        aria-label={`Supprimer l'entraînement du ${format(new Date(training.date), "EEEE d MMMM yyyy", {
                          locale: fr,
                        })}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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