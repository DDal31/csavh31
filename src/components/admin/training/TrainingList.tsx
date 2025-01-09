import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Training } from "@/types/training";

interface TrainingListProps {
  trainings: Training[];
  onEditClick: (training: Training) => void;
  onDeleteClick?: (training: Training) => void;
}

export function TrainingList({ trainings, onEditClick, onDeleteClick }: TrainingListProps) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Horaires</TableHead>
            <TableHead>Inscrits</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainings.map((training) => (
            <TableRow key={training.id}>
              <TableCell className="font-medium">
                {training.type === "other" ? training.other_type_details : training.type}
              </TableCell>
              <TableCell>
                {format(new Date(training.date), "EEEE d MMMM yyyy", { locale: fr })}
              </TableCell>
              <TableCell>
                {`${training.start_time} - ${training.end_time}`}
              </TableCell>
              <TableCell>
                {training.registrations?.length || 0} participants
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditClick(training)}
                    className="text-white hover:bg-gray-600"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  {onDeleteClick && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDeleteClick(training)}
                      className="text-white hover:bg-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}