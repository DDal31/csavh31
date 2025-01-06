import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Template } from "./types";

export function useTemplates() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching templates...");
      
      const { data, error: fetchError } = await supabase
        .from("template_settings")
        .select("*")
        .order("created_at");

      if (fetchError) {
        console.error("Error fetching templates:", fetchError);
        setError(fetchError);
        toast({
          title: "Erreur",
          description: "Impossible de charger les templates. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }

      console.log("Templates data:", data);

      if (!data || data.length === 0) {
        console.log("No templates found");
        setTemplates([]);
        return;
      }

      const convertedTemplates = data.map(template => ({
        ...template,
        color_scheme: typeof template.color_scheme === 'string' 
          ? JSON.parse(template.color_scheme)
          : template.color_scheme,
        layout_config: typeof template.layout_config === 'string'
          ? JSON.parse(template.layout_config)
          : template.layout_config,
        style: template.style as Template['style']
      }));
      
      setTemplates(convertedTemplates);
      
      const activeTemplate = convertedTemplates.find(t => t.is_active);
      if (activeTemplate) {
        setSelectedTemplate(activeTemplate.id);
      }
    } catch (error) {
      console.error("Error in fetchTemplates:", error);
      setError(error as Error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateChange = async (templateId: string) => {
    try {
      setLoading(true);
      console.log("Updating template:", templateId);

      const { error: updateError } = await supabase
        .from("template_settings")
        .update({ is_active: false })
        .neq("id", "placeholder");

      if (updateError) {
        console.error("Error deactivating templates:", updateError);
        throw updateError;
      }

      const { error: activateError } = await supabase
        .from("template_settings")
        .update({ is_active: true })
        .eq("id", templateId);

      if (activateError) {
        console.error("Error activating template:", activateError);
        throw activateError;
      }

      setSelectedTemplate(templateId);
      toast({
        title: "Succès",
        description: "Le template a été mis à jour",
      });

      await fetchTemplates();
    } catch (error) {
      console.error("Error in handleTemplateChange:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    templates,
    selectedTemplate,
    handleTemplateChange,
    refetch: fetchTemplates
  };
}