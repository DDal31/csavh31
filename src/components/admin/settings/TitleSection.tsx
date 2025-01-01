import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TitleSectionProps {
  settings: {
    site_title: string;
  };
  onSettingChange: (key: string, value: string) => Promise<void>;
}

export const TitleSection = ({ settings, onSettingChange }: TitleSectionProps) => {
  return (
    <Card className="bg-gray-800 p-6 rounded-lg space-y-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Titre du site</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="site_title" className="text-white">
            Titre affiché dans l'en-tête
          </Label>
          <Input
            id="site_title"
            value={settings.site_title}
            onChange={(e) => onSettingChange("site_title", e.target.value)}
            className="bg-gray-700 text-white"
            placeholder="Titre du site"
            aria-label="Modifier le titre du site"
          />
        </div>
      </CardContent>
    </Card>
  );
};