import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InstantNotificationForm } from "@/components/admin/notifications/instant/InstantNotificationForm";
import { NotificationHistoryList } from "@/components/admin/notifications/instant/NotificationHistoryList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminInstantNotifications() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => navigate("/admin/settings/notifications")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant="outline"
              className="ml-4"
            >
              {showForm ? "Voir l'historique" : "Nouvelle notification"}
            </Button>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-6">
              {showForm ? "Envoyer une notification" : "Historique des notifications"}
            </h1>

            {showForm ? (
              <InstantNotificationForm />
            ) : (
              <NotificationHistoryList />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}