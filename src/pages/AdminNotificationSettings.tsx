import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationSettingsList } from "@/components/admin/notifications/NotificationSettingsList";
import { NotificationSettingsForm } from "@/components/admin/notifications/NotificationSettingsForm";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminNotificationSettings = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const handleClose = () => {
    setShowForm(false);
    setEditingSetting(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main 
        className="container mx-auto px-4 py-8"
        role="main"
        aria-label="Configuration des notifications"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
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
            <Button
              onClick={() => navigate("/admin/settings/notifications/instant")}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              aria-label="Envoyer une notification instantanée"
            >
              <Send className="h-4 w-4 mr-2" />
              Notification instantanée
            </Button>
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
                onAddClick={() => setShowForm(true)}
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