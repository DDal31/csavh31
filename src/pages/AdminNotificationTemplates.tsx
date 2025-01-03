import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NotificationTemplatesList } from "@/components/admin/notifications/templates/NotificationTemplatesList";
import { NotificationTemplateForm } from "@/components/admin/notifications/templates/NotificationTemplateForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              Modèles de Notification
            </h1>
            <div className="space-x-4">
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Modèle
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/admin/settings")}
              >
                Retour
              </Button>
            </div>
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