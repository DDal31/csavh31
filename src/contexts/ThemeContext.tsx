import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Template, templates } from "@/types/template";

interface ThemeContextType {
  currentTemplate: Template | null;
  updateCurrentTemplate: (template: Template) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const fetchActiveTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from('template_settings')
          .select('name')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          const template = templates.find(t => t.id === data.name);
          if (template) {
            console.log("Template actif chargé:", template.name);
            setCurrentTemplate(template);
            applyTemplateStyles(template);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement du template:", error);
      }
    };

    fetchActiveTemplate();
  }, []);

  const applyTemplateStyles = (template: Template) => {
    document.documentElement.setAttribute('data-theme', template.theme);
    document.documentElement.style.setProperty('--primary', template.primaryColor);
    document.documentElement.style.setProperty('--secondary', template.secondaryColor);
  };

  const updateCurrentTemplate = (template: Template) => {
    setCurrentTemplate(template);
    applyTemplateStyles(template);
  };

  return (
    <ThemeContext.Provider value={{ currentTemplate, updateCurrentTemplate }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};