import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrainingNotificationForm } from "@/components/admin/notifications/training/TrainingNotificationForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminTrainingNotification() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6 text-purple-300 hover:text-white hover:bg-purple-800/50"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <h1 className="text-2xl font-bold text-white mb-6">
            Envoyer une notification
          </h1>

          <TrainingNotificationForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}