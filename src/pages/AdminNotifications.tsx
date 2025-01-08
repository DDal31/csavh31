import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  sent_at: string;
  status: 'success' | 'error';
  error_message: string | null;
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          navigate("/dashboard");
          return;
        }

        loadNotifications();
      } catch (error) {
        console.error("Error checking auth:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_history")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match NotificationHistory type
      const transformedData: NotificationHistory[] = data.map(item => ({
        id: item.id,
        title: item.title,
        body: item.content,
        sent_at: item.sent_at,
        status: 'success',
        error_message: null
      }));

      setNotifications(transformedData);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <Bell className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">
                Historique des Notifications
              </h1>
            </div>
            <Button
              onClick={() => navigate("/admin/settings")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Retour
            </Button>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Titre</TableHead>
                  <TableHead className="text-white">Message</TableHead>
                  <TableHead className="text-white">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="text-gray-300">
                      {format(new Date(notification.sent_at), "Pp", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {notification.title}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {notification.body}
                    </TableCell>
                    <TableCell>
                      {notification.status === "success" ? (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Succès
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <XCircle className="h-5 w-5 mr-2" />
                          Erreur
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}