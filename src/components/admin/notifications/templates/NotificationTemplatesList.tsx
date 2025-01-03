import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface NotificationTemplate {
  id: string;
  title: string;
  content: string;
  type: string;
  sport?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationTemplatesListProps {
  onEdit: (template: NotificationTemplate) => void;
  onDelete: (id: string) => void;
}

export function NotificationTemplatesList({
  onEdit,
  onDelete,
}: NotificationTemplatesListProps) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as NotificationTemplate[];
    },
  });

  if (isLoading) {
    return <div>Chargement des modèles...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sport</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template) => (
            <TableRow key={template.id}>
              <TableCell>{template.title}</TableCell>
              <TableCell>{template.type}</TableCell>
              <TableCell>{template.sport || "Tous"}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(template)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}