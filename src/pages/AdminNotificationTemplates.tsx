import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NotificationTemplatesList } from "@/components/admin/notifications/templates/NotificationTemplatesList";
import { NotificationTemplateForm } from "@/components/admin/notifications/templates/NotificationTemplateForm";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface NotificationTemplate {
  id: string;
  title: string;
  content: string;
  type: string;
  sport?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminNotificationTemplates() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("notification_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du modèle.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Modèle supprimé",
        description: "Le modèle de notification a été supprimé avec succès.",
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8" role="main">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              onClick={() => navigate("/admin/settings")}
              variant="ghost"
              className="mr-4 text-gray-300 hover:text-white hover:bg-gray-800"
              aria-label="Retour aux paramètres"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-white flex-grow">
              Modèles de Notification
            </h1>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                aria-label="Créer un nouveau modèle de notification"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Nouveau Modèle
              </Button>
            )}
          </div>

          {showForm ? (
            <NotificationTemplateForm
              template={selectedTemplate}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false);
                setSelectedTemplate(null);
              }}
            />
          ) : (
            <NotificationTemplatesList
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}