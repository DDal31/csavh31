import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { TemplateSelector } from "@/components/admin/template/TemplateSelector";
import { templates } from "@/types/template";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminTemplateSettings = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('classic-light');

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast.success(`Le template "${template.name}" a été sélectionné.`);
    }
  };

  const handleApplyChanges = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      toast.success("Les changements de template ont été appliqués avec succès.");
      console.log("Template appliqué:", template);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Button
          onClick={() => navigate("/admin/settings")}
          variant="ghost"
          className="mb-6 text-gray-300 hover:text-white hover:bg-gray-800 flex items-center"
          aria-label="Retour aux paramètres"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">
            Template du Site
          </h1>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h2 className="text-xl font-semibold text-white">
                Sélection du Template
              </h2>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                templates={templates}
                selectedTemplate={selectedTemplate}
                onTemplateChange={handleTemplateChange}
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleApplyChanges}
            className="w-full sm:w-auto mt-8"
            size="lg"
          >
            Appliquer les modifications
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTemplateSettings;