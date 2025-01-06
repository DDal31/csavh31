import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Template } from "./types";

interface TemplateCardProps {
  template: Template;
  selectedTemplate: string;
}

export function TemplateCard({ template, selectedTemplate }: TemplateCardProps) {
  return (
    <div className="relative">
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
  );
}