import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const REQUIRED_ICON_SIZES = [
  { size: 512, name: "club-logo.png", label: "Logo principal (512x512)" },
  { size: 192, name: "app-icon-192.png", label: "App Icon 192x192" },
  { size: 180, name: "app-icon-180.png", label: "iOS Icon 180x180" },
  { size: 152, name: "app-icon-152.png", label: "iOS Icon 152x152" },
  { size: 120, name: "app-icon-120.png", label: "iOS Icon 120x120" },
  { size: 76, name: "app-icon-76.png", label: "iOS Icon 76x76" },
  { size: 60, name: "app-icon-60.png", label: "iOS Icon 60x60" },
  { size: 32, name: "app-icon-32.png", label: "Favicon 32x32" },
  { size: 16, name: "app-icon-16.png", label: "Favicon 16x16" }
];

export const IconsUploadSection = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const updateIconsInSettings = async () => {
      try {
        console.log("Updating icons in settings...");
        
        // Pour chaque taille d'icône requise
        for (const { name } of REQUIRED_ICON_SIZES) {
          // Vérifier si l'icône existe dans le bucket
          const { data: fileExists } = await supabase.storage
            .from("site-assets")
            .list("", {
              search: name
            });

          if (fileExists && fileExists.length > 0) {
            console.log(`Found icon: ${name}`);
            
            // Obtenir l'URL publique
            const { data: { publicUrl } } = supabase.storage
              .from("site-assets")
              .getPublicUrl(name);

            // Mettre à jour le paramètre dans site_settings
            const settingKey = `icon_${name.replace(/\./g, '_')}`;
            const { error: updateError } = await supabase
              .from("site_settings")
              .upsert({
                setting_key: settingKey,
                setting_value: publicUrl
              });

            if (updateError) {
              console.error(`Error updating setting for ${name}:`, updateError);
              throw updateError;
            }

            console.log(`Updated setting for ${name} with URL: ${publicUrl}`);
          }
        }

        toast({
          title: "Succès",
          description: "Les icônes ont été mises à jour avec succès"
        });
      } catch (error) {
        console.error("Error updating icons in settings:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour les icônes",
          variant: "destructive"
        });
      }
    };

    updateIconsInSettings();
  }, [toast]);

  const validateImageDimensions = (file: File, requiredSize: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img.width === requiredSize && img.height === requiredSize);
      };
    });
  };

  const handleIconUpload = async (event: React.ChangeEvent<HTMLInputElement>, iconSize: number, fileName: string) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      console.log(`Uploading icon ${fileName} (${iconSize}x${iconSize})`);

      const isValidSize = await validateImageDimensions(file, iconSize);
      if (!isValidSize) {
        toast({
          title: "Erreur de dimensions",
          description: `L'image doit être exactement de ${iconSize}x${iconSize} pixels`,
          variant: "destructive"
        });
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error("Erreur lors de l'upload:", uploadError);
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from("site-assets")
        .getPublicUrl(fileName);

      // Mettre à jour le paramètre dans site_settings
      const settingKey = `icon_${fileName.replace(/\./g, '_')}`;
      const { error: updateError } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: settingKey,
          setting_value: publicUrl
        });

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Succès",
        description: `Icône ${fileName} mise à jour avec succès`
      });

    } catch (error) {
      console.error("Erreur lors de l'upload de l'icône:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'icône",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Icônes de l'application
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {REQUIRED_ICON_SIZES.map(({ size, name, label }) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={`icon-${size}`} className="text-white">
              {label}
            </Label>
            <Input
              id={`icon-${size}`}
              type="file"
              accept="image/png"
              onChange={(e) => handleIconUpload(e, size, name)}
              disabled={uploading}
              className="bg-gray-700 text-white"
              aria-label={`Télécharger ${label}`}
            />
          </div>
        ))}
        {uploading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};