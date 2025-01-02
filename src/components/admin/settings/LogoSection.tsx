import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LogoSectionProps {
  settings: {
    logo_shape: string;
  };
  onSettingChange: (key: string, value: string) => Promise<void>;
}

export const LogoSection = ({ settings, onSettingChange }: LogoSectionProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Handling logo upload...");
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);

      // Vérifier les dimensions de l'image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = () => {
          if (img.width !== 512 || img.height !== 512) {
            toast({
              title: "Erreur",
              description: "L'image doit être de 512x512 pixels",
              variant: "destructive"
            });
            setUploading(false);
            return;
          }
          resolve(true);
        };
      });

      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', 'club-logo.png');

      // Appeler la fonction Edge pour sauvegarder le fichier
      const response = await fetch('/api/save-public-icon', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'upload');
      }

      // Mettre à jour le paramètre logo_url avec upsert
      const { error: updateError } = await supabase
        .from("site_settings")
        .upsert({ 
          setting_key: "logo_url", 
          setting_value: "club-logo.png" 
        }, {
          onConflict: 'setting_key'
        });

      if (updateError) {
        console.error("Error updating logo_url setting:", updateError);
        throw updateError;
      }

      toast({
        title: "Succès",
        description: "Logo mis à jour avec succès"
      });
    } catch (error) {
      console.error("Error in handleLogoUpload:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-gray-800 p-6 rounded-lg space-y-4">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">Logo du site</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logo" className="text-white">
            Télécharger un nouveau logo (512x512 pixels)
          </Label>
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={uploading}
            className="bg-gray-700 text-white"
            aria-label="Sélectionner un fichier pour le logo du site"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logo_shape" className="text-white">
            Forme du logo
          </Label>
          <select
            id="logo_shape"
            value={settings.logo_shape}
            onChange={(e) => onSettingChange("logo_shape", e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            aria-label="Sélectionner la forme du logo"
          >
            <option value="round">Rond</option>
            <option value="square">Carré</option>
          </select>
        </div>

        {uploading && (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};