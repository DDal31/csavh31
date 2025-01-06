import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Template } from "./types";

export function useTemplates() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("template_settings")
        .select("*")
        .order("created_at");

      if (error) throw error;

      const convertedTemplates = data.map(template => ({
        ...template,
        color_scheme: typeof template.color_scheme === 'string' 
          ? JSON.parse(template.color_scheme)
          : template.color_scheme,
        layout_config: typeof template.layout_config === 'string'
          ? JSON.parse(template.layout_config)
          : template.layout_config,
        style: template.style as Template['style']
      })) as Template[];
      
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

      const { error: updateError } = await supabase
        .from("template_settings")
        .update({ is_active: false })
        .neq("id", "placeholder");

      if (updateError) throw updateError;

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

      await fetchTemplates();
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

  return {
    loading,
    templates,
    selectedTemplate,
    handleTemplateChange
  };
}