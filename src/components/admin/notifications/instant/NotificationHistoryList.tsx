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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export function NotificationHistoryList() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_history")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="sr-only">Chargement de l'historique des notifications...</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-purple-500/20 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-purple-500/20">
              <TableHead className="text-purple-300 bg-gray-800/50">Titre</TableHead>
              <TableHead className="text-purple-300 bg-gray-800/50">Contenu</TableHead>
              <TableHead className="text-purple-300 bg-gray-800/50">Groupe cible</TableHead>
              <TableHead className="text-purple-300 bg-gray-800/50">Sport</TableHead>
              <TableHead className="text-purple-300 bg-gray-800/50">Date d'envoi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications?.map((notification) => (
              <TableRow 
                key={notification.id}
                className="border-b border-purple-500/10 hover:bg-purple-900/20"
              >
                <TableCell className="text-gray-300">{notification.title}</TableCell>
                <TableCell className="text-gray-300">{notification.content}</TableCell>
                <TableCell className="text-gray-300">
                  {notification.target_group === "all"
                    ? "Tous les utilisateurs"
                    : "Sport spécifique"}
                </TableCell>
                <TableCell className="text-gray-300">
                  {notification.sport || "-"}
                </TableCell>
                <TableCell className="text-gray-300">
                  {format(new Date(notification.sent_at), "PPp", { locale: fr })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}