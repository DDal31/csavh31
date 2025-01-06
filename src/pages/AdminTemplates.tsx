import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TemplateCard } from "@/components/admin/templates/TemplateCard";
import { useTemplates } from "@/components/admin/templates/useTemplates";
import { useNavigate } from "react-router-dom";

export default function AdminTemplates() {
  const navigate = useNavigate();
  const { loading, templates, selectedTemplate, handleTemplateChange } = useTemplates();

  if (loading) {
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
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate("/admin/settings")}
              variant="ghost"
              className="text-white hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-white">Templates</h1>
          </div>

          <RadioGroup
            value={selectedTemplate}
            onValueChange={handleTemplateChange}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
          >
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selectedTemplate={selectedTemplate}
              />
            ))}
          </RadioGroup>
        </div>
      </main>
      <Footer />
    </div>
  );
}