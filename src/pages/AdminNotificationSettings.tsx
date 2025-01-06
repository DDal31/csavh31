import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { NotificationSettingsList } from "@/components/admin/notifications/NotificationSettingsList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";

const AdminNotificationSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/admin/settings")}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                aria-label="Retour aux paramètres"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-white">
                Gestion des Notifications
              </h1>
            </div>
            <Button
              onClick={() => navigate("/admin/settings/notifications/instant")}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
              aria-label="Envoyer une nouvelle notification"
            >
              <Send className="h-4 w-4 mr-2" />
              Nouvelle notification
            </Button>
          </div>

          <NotificationSettingsList />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminNotificationSettings;