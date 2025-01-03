import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationSettingsList } from "@/components/admin/notifications/NotificationSettingsList";
import { NotificationSettingsForm } from "@/components/admin/notifications/NotificationSettingsForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminNotificationSettings = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      console.log("Fetching notification settings...");
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .order("type");

      if (error) {
        console.error("Error fetching notification settings:", error);
        throw error;
      }

      console.log("Notification settings fetched:", data);
      return data;
    },
  });

  const handleEdit = (setting) => {
    console.log("Opening edit form for setting:", setting);
    setEditingSetting(setting);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingSetting(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="sr-only">Chargement des paramètres de notification...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main 
        className="container mx-auto px-4 py-8"
        role="main"
        aria-label="Configuration des notifications"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin/settings")}
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              aria-label="Retour aux paramètres"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-white">
              Configuration des Notifications
            </h1>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            {showForm ? (
              <NotificationSettingsForm
                setting={editingSetting}
                onSuccess={handleClose}
                onCancel={handleClose}
              />
            ) : (
              <NotificationSettingsList
                settings={settings}
                onAddClick={() => setShowForm(true)}
                onEditClick={handleEdit}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNotificationSettings;