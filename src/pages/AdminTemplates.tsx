import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ColorScheme {
  primary: string;
  background: string;
  card: string;
  muted: string;
}

interface LayoutConfig {
  tileLayout: string;
  logoPosition: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  style: "default" | "modern" | "minimal" | "playful" | "professional";
  color_scheme: ColorScheme;
  layout_config: LayoutConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to convert database response to Template type
const convertToTemplate = (data: any): Template => {
  return {
    ...data,
    color_scheme: typeof data.color_scheme === 'string' 
      ? JSON.parse(data.color_scheme)
      : data.color_scheme,
    layout_config: typeof data.layout_config === 'string'
      ? JSON.parse(data.layout_config)
      : data.layout_config
  };
};

const AdminTemplates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          console.log("Accès non autorisé : l'utilisateur n'est pas admin");
          navigate("/dashboard");
          return;
        }

        await fetchTemplates();
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("template_settings")
        .select("*")
        .order("created_at");

      if (error) throw error;

      // Convert the data to Template type
      const convertedTemplates = data.map(convertToTemplate);
      setTemplates(convertedTemplates);
      
      const activeTemplate = convertedTemplates.find(t => t.is_active);
      if (activeTemplate) {
        setSelectedTemplate(activeTemplate.id);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des templates:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      setLoading(true);

      // Désactiver tous les templates
      const { error: updateError } = await supabase
        .from("template_settings")
        .update({ is_active: false })
        .neq("id", "placeholder");

      if (updateError) throw updateError;

      // Activer le template sélectionné
      const { error: activateError } = await supabase
        .from("template_settings")
        .update({ is_active: true })
        .eq("id", templateId);

      if (activateError) throw activateError;

      setSelectedTemplate(templateId);
      toast({
        title: "Succès",
        description: "Le template a été mis à jour",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du template:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <div key={template.id} className="relative">
                <RadioGroupItem
                  value={template.id}
                  id={template.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={template.id}
                  className="block cursor-pointer"
                >
                  <Card className={`p-6 bg-gray-800 border-2 transition-all
                    ${selectedTemplate === template.id ? "border-blue-500" : "border-gray-700"}
                    hover:border-blue-400`}
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {template.name}
                        </h3>
                        <p className="text-gray-400">{template.description}</p>
                      </div>

                      <div 
                        className="aspect-video rounded-lg p-4 flex items-center justify-center"
                        style={{ 
                          backgroundColor: template.color_scheme.background,
                          color: template.color_scheme.primary 
                        }}
                      >
                        <div className="text-center">
                          <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                              <div
                                key={n}
                                className="aspect-square rounded"
                                style={{ backgroundColor: template.color_scheme.card }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTemplates;