import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Template } from "@/types/template";

interface TemplateCardProps {
  template: Template;
  isSelected: boolean;
}

export const TemplateCard = ({ template, isSelected }: TemplateCardProps) => {
  return (
    <div className="relative">
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
        <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg">
          <img
            src={template.preview_image}
            alt={`Aperçu du template ${template.name}`}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm text-gray-400">{template.description}</p>
        <div 
          className="mt-3 h-2 rounded"
          style={{ backgroundColor: template.primaryColor }}
        />
      </Label>
      {isSelected && (
        <Check className="absolute top-4 right-4 h-4 w-4 text-primary" />
      )}
    </div>
  );
};