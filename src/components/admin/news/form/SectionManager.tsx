import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ArticleSection } from "../ArticleSection";
import type { Section } from "@/types/news";

interface SectionManagerProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
}

export const SectionManager = ({ sections, onChange }: SectionManagerProps) => {
  const addSection = () => {
    onChange([...sections, { subtitle: "", content: "", imagePath: "" }]);
  };

  const updateSection = (index: number, field: keyof Section, value: string | File) => {
    const newSections = [...sections];
    if (field === "imagePath" && typeof value === "string") {
      newSections[index].imagePath = value;
    } else if (typeof value === "string") {
      (newSections[index] as any)[field] = value;
    }
    onChange(newSections);
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <ArticleSection
          key={index}
          section={section}
          onChange={(field, value) => updateSection(index, field, value)}
          index={index}
        />
      ))}

      <Button
        type="button"
        onClick={addSection}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white"
        aria-label="Ajouter un sous-titre, une photo et du texte"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une section
      </Button>
    </div>
  );
};