import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function NotificationHistoryList() {
  const { data: history, isLoading } = useQuery({
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
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!history?.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        Aucune notification n'a été envoyée pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((notification) => (
        <Card
          key={notification.id}
          className="p-4 bg-gray-800 border-gray-700"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-200">{notification.title}</h3>
              <p className="text-gray-400 mt-1">{notification.content}</p>
              {notification.sport && (
                <span className="inline-block bg-purple-900/50 text-purple-200 text-sm px-2 py-1 rounded mt-2">
                  Sport : {notification.sport}
                </span>
              )}
            </div>
            <time className="text-sm text-gray-500">
              {new Date(notification.sent_at).toLocaleDateString()}
            </time>
          </div>
        </Card>
      ))}
    </div>
  );
}