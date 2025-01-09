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
        console.log("Fetching active template from database...");
        const { data, error } = await supabase
          .from('template_settings')
          .select('name')
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          const template = templates.find(t => t.id === data.name);
          if (template) {
            console.log("Active template loaded:", template.name);
            setCurrentTemplate(template);
            applyTemplateStyles(template);
          }
        }
      } catch (error) {
        console.error("Error loading template:", error);
      }
    };

    fetchActiveTemplate();
  }, []);

  const applyTemplateStyles = (template: Template) => {
    console.log("Applying template styles:", template.name);
    document.documentElement.setAttribute('data-theme', template.theme);
    
    // Appliquer les couleurs du template
    const root = document.documentElement;
    if (template.theme === 'light') {
      root.style.setProperty('--background', '0 0% 100%');
      root.style.setProperty('--foreground', '222.2 84% 4.9%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--popover', '0 0% 100%');
      root.style.setProperty('--popover-foreground', '222.2 84% 4.9%');
      root.style.setProperty('--primary', template.primaryColor);
      root.style.setProperty('--primary-foreground', '210 40% 98%');
      root.style.setProperty('--secondary', template.secondaryColor);
      root.style.setProperty('--secondary-foreground', '222.2 47.4% 11.2%');
      root.style.setProperty('--muted', '210 40% 96.1%');
      root.style.setProperty('--muted-foreground', '215.4 16.3% 46.9%');
      root.style.setProperty('--accent', '210 40% 96.1%');
      root.style.setProperty('--accent-foreground', '222.2 47.4% 11.2%');
    } else {
      root.style.setProperty('--background', '222.2 84% 4.9%');
      root.style.setProperty('--foreground', '210 40% 98%');
      root.style.setProperty('--card', '222.2 84% 4.9%');
      root.style.setProperty('--card-foreground', '210 40% 98%');
      root.style.setProperty('--popover', '222.2 84% 4.9%');
      root.style.setProperty('--popover-foreground', '210 40% 98%');
      root.style.setProperty('--primary', template.primaryColor);
      root.style.setProperty('--primary-foreground', '222.2 47.4% 11.2%');
      root.style.setProperty('--secondary', template.secondaryColor);
      root.style.setProperty('--secondary-foreground', '210 40% 98%');
      root.style.setProperty('--muted', '217.2 32.6% 17.5%');
      root.style.setProperty('--muted-foreground', '215 20.2% 65.1%');
      root.style.setProperty('--accent', '217.2 32.6% 17.5%');
      root.style.setProperty('--accent-foreground', '210 40% 98%');
    }
  };

  const updateCurrentTemplate = (template: Template) => {
    console.log("Updating current template to:", template.name);
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