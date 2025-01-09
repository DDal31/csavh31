import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sun, Moon, Layout, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  theme: 'light' | 'dark';
  layout: 'classic' | 'modern' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
}

const templates: Template[] = [
  {
    id: 'classic-light',
    name: 'Classique Clair',
    description: 'Design traditionnel avec une mise en page claire et épurée',
    theme: 'light',
    layout: 'classic',
    primaryColor: '#4169E1',
    secondaryColor: '#F1F1F1'
  },
  {
    id: 'classic-dark',
    name: 'Classique Sombre',
    description: 'Design traditionnel avec un thème sombre élégant',
    theme: 'dark',
    layout: 'classic',
    primaryColor: '#4169E1',
    secondaryColor: '#1A1F2C'
  },
  {
    id: 'modern-light',
    name: 'Moderne Clair',
    description: 'Design contemporain avec des éléments visuels modernes',
    theme: 'light',
    layout: 'modern',
    primaryColor: '#9b87f5',
    secondaryColor: '#F6F6F7'
  },
  {
    id: 'modern-dark',
    name: 'Moderne Sombre',
    description: 'Design contemporain avec un thème sombre sophistiqué',
    theme: 'dark',
    layout: 'modern',
    primaryColor: '#9b87f5',
    secondaryColor: '#221F26'
  },
  {
    id: 'minimal-light',
    name: 'Minimaliste Clair',
    description: 'Design épuré avec une emphase sur le contenu',
    theme: 'light',
    layout: 'minimal',
    primaryColor: '#0EA5E9',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'minimal-dark',
    name: 'Minimaliste Sombre',
    description: 'Design épuré avec un thème sombre minimaliste',
    theme: 'dark',
    layout: 'minimal',
    primaryColor: '#0EA5E9',
    secondaryColor: '#222222'
  }
];

const AdminTemplateSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic-light');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [selectedLayout, setSelectedLayout] = useState<'classic' | 'modern' | 'minimal'>('classic');

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

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSelectedTheme(template.theme);
      setSelectedLayout(template.layout);
      toast({
        title: "Template sélectionné",
        description: `Le template "${template.name}" a été sélectionné.`,
      });
    }
  };

  const handleApplyChanges = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      toast({
        title: "Modifications appliquées",
        description: "Les changements de template ont été appliqués avec succès.",
      });
      console.log("Template appliqué:", template);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

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

          <div className="grid gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white">Sélection du Template</h2>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedTemplate}
                  onValueChange={handleTemplateChange}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                        className="flex flex-col p-4 border rounded-lg cursor-pointer border-gray-600 hover:border-primary peer-checked:border-primary peer-checked:bg-gray-700"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-white">{template.name}</span>
                          {template.theme === 'light' ? (
                            <Sun className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <Moon className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{template.description}</p>
                        <div 
                          className="mt-3 h-2 rounded"
                          style={{ backgroundColor: template.primaryColor }}
                        />
                      </Label>
                      {selectedTemplate === template.id && (
                        <Check className="absolute top-4 right-4 h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button
              onClick={handleApplyChanges}
              className="w-full sm:w-auto"
              size="lg"
            >
              Appliquer les modifications
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminTemplateSettings;