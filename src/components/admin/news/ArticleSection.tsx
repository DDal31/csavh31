import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "./ImageUpload";

interface Section {
  subtitle: string;
  content: string;
  imagePath?: string;
}

interface ArticleSectionProps {
  section: Section;
  onChange: (field: keyof Section, value: string) => void;
  index: number;
}

export const ArticleSection = ({ section, onChange, index }: ArticleSectionProps) => {
  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="space-y-4">
        <div>
          <label
            htmlFor={`subtitle-${index}`}
            className="block text-sm font-medium mb-2 text-white"
          >
            Sous-titre
          </label>
          <Input
            id={`subtitle-${index}`}
            value={section.subtitle}
            onChange={(e) => onChange("subtitle", e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
            placeholder="Entrez le sous-titre"
            aria-label={`Sous-titre de la section ${index + 1}`}
          />
        </div>

        <div>
          <label
            htmlFor={`content-${index}`}
            className="block text-sm font-medium mb-2 text-white"
          >
            Contenu
          </label>
          <Textarea
            id={`content-${index}`}
            value={section.content}
            onChange={(e) => onChange("content", e.target.value)}
            className="bg-gray-700 border-gray-600 min-h-[150px] text-white"
            placeholder="Entrez le contenu"
            aria-label={`Contenu de la section ${index + 1}`}
          />
        </div>

        <ImageUpload
          label="Image de section"
          onChange={(file) => {
            if (file) {
              onChange("imagePath", URL.createObjectURL(file));
            }
          }}
          preview={section.imagePath}
        />
      </div>
    </Card>
  );
};