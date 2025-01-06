import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettingsList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notification-history"],
    queryFn: async () => {
      console.log("Fetching notification history...");
      const { data, error } = await supabase
        .from("notification_history")
        .select("*")
        .order("sent_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }
      
      console.log("Notifications fetched:", data);
      return data;
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting notification:", id);
      const { error } = await supabase
        .from("notification_history")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-history"] });
      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée avec succès",
      });
    },
    onError: (error) => {
      console.error("Error deleting notification:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="sr-only">Chargement des notifications...</span>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="text-center py-8 text-gray-400" role="status">
        Aucune notification n'a été envoyée pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">
        Historique des Notifications
      </h2>
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="p-4 bg-gray-800 border-gray-700"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex-grow">
              <h3 className="font-medium text-gray-200">
                {notification.title}
              </h3>
              <p className="text-gray-400 mt-1 break-words">
                {notification.content}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {notification.sport && (
                  <span className="inline-block bg-purple-900/50 text-purple-200 text-sm px-2 py-1 rounded">
                    Sport : {notification.sport}
                  </span>
                )}
                <span className="inline-block bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded">
                  Envoyée le : {new Date(notification.sent_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteNotification.mutate(notification.id)}
              className="shrink-0"
              aria-label={`Supprimer la notification "${notification.title}"`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}