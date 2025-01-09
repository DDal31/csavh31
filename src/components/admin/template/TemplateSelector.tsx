import { RadioGroup } from "@/components/ui/radio-group";
import { TemplateCard } from "./TemplateCard";
import { Template } from "@/types/template";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export const TemplateSelector = ({
  templates,
  selectedTemplate,
  onTemplateChange,
}: TemplateSelectorProps) => {
  return (
    <RadioGroup
      value={selectedTemplate}
      onValueChange={onTemplateChange}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          isSelected={selectedTemplate === template.id}
        />
      ))}
    </RadioGroup>
  );
};