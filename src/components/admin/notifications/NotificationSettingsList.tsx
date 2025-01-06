import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface NotificationHistory {
  id: string;
  title: string;
  content: string;
  target_group: string;
  sport?: string;
  sent_at: string;
}

interface NotificationSettingsListProps {
  onAddClick: () => void;
}

export function NotificationSettingsList({
  onAddClick,
}: NotificationSettingsListProps) {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async () => {
      console.log("Fetching notification history...");
      const { data, error } = await supabase
        .from("notification_history")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) {
        console.error("Error fetching notification history:", error);
        throw error;
      }

      console.log("Notification history fetched:", data);
      return data as NotificationHistory[];
    },
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-purple-500/20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-white">
          Historique des Notifications
        </h1>
        <Button 
          onClick={onAddClick} 
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          aria-label="Créer une nouvelle notification"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nouvelle Notification
        </Button>
      </div>

      {isLoading ? (
        <div 
          className="flex justify-center items-center py-8"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="sr-only">Chargement de l'historique des notifications...</span>
        </div>
      ) : !notifications?.length ? (
        <div 
          className="text-center py-8 text-gray-400"
          aria-live="polite"
        >
          Aucune notification n'a été envoyée pour le moment.
        </div>
      ) : (
        <div className="overflow-x-auto" role="region" aria-label="Historique des notifications envoyées">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-purple-500/20">
                <TableHead className="text-purple-300">Date d'envoi</TableHead>
                <TableHead className="text-purple-300">Titre</TableHead>
                <TableHead className="text-purple-300">Contenu</TableHead>
                <TableHead className="text-purple-300">Groupe cible</TableHead>
                <TableHead className="text-purple-300">Sport</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow 
                  key={notification.id}
                  className="border-b border-purple-500/10 hover:bg-purple-900/20"
                >
                  <TableCell className="text-gray-300">
                    {new Date(notification.sent_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell className="text-gray-300">{notification.title}</TableCell>
                  <TableCell className="text-gray-300 max-w-md">
                    <div className="truncate" title={notification.content}>
                      {notification.content}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{notification.target_group}</TableCell>
                  <TableCell className="text-gray-300">{notification.sport || "Tous"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}