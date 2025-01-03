import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationSettingsList } from "@/components/admin/notifications/NotificationSettingsList";
import { NotificationSettingsForm } from "@/components/admin/notifications/NotificationSettingsForm";
import { Loader2 } from "lucide-react";

interface NotificationSetting {
  id: string;
  type: string;
  notification_type: "training_reminder" | "missing_players" | "custom";
  delay_hours: number;
  enabled: boolean;
  sport?: string;
  target_group?: "all" | "sport_specific" | "training_registered";
  sound_path?: string;
  logo_path?: string;
  created_at: string;
  updated_at: string;
}

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white">
              Configuration des Notifications
            </h1>
            <button
              onClick={() => navigate("/admin/settings")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retour
            </button>
          </div>

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
      </main>
      <Footer />
    </div>
  );
};

export default AdminNotificationSettings;