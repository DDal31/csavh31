import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { TemplateSelector } from "@/components/admin/template/TemplateSelector";
import { templates } from "@/types/template";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminTemplateSettings = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('classic-light');
  const [isLoading, setIsLoading] = useState(false);
  const { updateCurrentTemplate } = useTheme();

  useEffect(() => {
    const fetchCurrentTemplate = async () => {
      try {
        console.log("Fetching current template settings...");
        const { data, error } = await supabase
          .from('template_settings')
          .select('name')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setSelectedTemplate(data.name);
          console.log("Template actif chargé:", data.name);
          
          // Appliquer le template actif immédiatement
          const template = templates.find(t => t.id === data.name);
          if (template) {
            updateCurrentTemplate(template);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du template:", error);
        toast.error("Erreur lors du chargement du template");
      }
    };

    fetchCurrentTemplate();
  }, [updateCurrentTemplate]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      console.log("Nouveau template sélectionné:", template.name);
      // Appliquer le template immédiatement lors de la sélection
      updateCurrentTemplate(template);
      toast.success(`Le template "${template.name}" a été sélectionné.`);
    }
  };

  const handleApplyChanges = async () => {
    setIsLoading(true);
    const template = templates.find(t => t.id === selectedTemplate);
    
    if (!template) {
      toast.error("Template invalide");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Applying template changes...");
      // Désactiver tous les templates
      await supabase
        .from('template_settings')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Créer ou mettre à jour le template sélectionné
      const { error } = await supabase
        .from('template_settings')
        .upsert({
          name: template.id,
          description: template.description,
          style: template.theme === 'light' ? 'default' : 'modern',
          color_scheme: {
            primary: template.primaryColor,
            secondary: template.secondaryColor
          },
          layout_config: {
            layout: template.layout
          },
          is_active: true
        }, {
          onConflict: 'name'
        });

      if (error) throw error;

      // Mettre à jour le thème global
      updateCurrentTemplate(template);

      console.log("Template appliqué avec succès:", template.name);
      toast.success("Les changements de template ont été appliqués avec succès.");

    } catch (error) {
      console.error("Erreur lors de l'application du template:", error);
      toast.error("Erreur lors de l'application du template");
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
          >
            {isLoading ? "Application en cours..." : "Appliquer les modifications"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTemplateSettings;