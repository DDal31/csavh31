import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LogoSectionProps {
  settings: {
    logo_shape: string;
    logo_url?: string;
  };
  onSettingChange: (key: string, value: string) => void;
}

export const LogoSection = ({ settings, onSettingChange }: LogoSectionProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Plus de blocage sur la taille exacte: on laisse l'Edge Function gérer
      setSelectedFile(file);
      setUploadResults(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error in onFileSelect:", error);
    }
  };

  const handleUploadClick = async () => {
    try {
      if (!selectedFile) return;
      setUploading(true);
      console.log("Uploading single logo to storage (no generation)");

      const filePath = 'club-logo.png';
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type || 'image/png'
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw uploadError;
      }

      const { error: settingError } = await supabase
        .from('site_settings')
        .upsert({ setting_key: 'logo_url', setting_value: filePath }, { onConflict: 'setting_key' });

      if (settingError) {
        console.error("Setting update error:", settingError);
        throw settingError;
      }

      toast({
        title: 'Succès',
        description: 'Logo enregistré. Il sera utilisé comme icône partout.',
        duration: 4000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Error in handleUploadClick:", error);
      const message = error instanceof Error
        ? error.message
        : (error && (error as any).message) ? (error as any).message : 'Vérifiez les logs pour plus de détails.';
      toast({
        title: 'Erreur',
        description: `Échec de l’enregistrement du logo : ${message}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

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

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Logo de l'application
        </CardTitle>
        <p className="text-sm text-gray-400">
          Uploadez un logo 512x512px — il sera utilisé partout (favicon, PWA, iOS, Android)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prévisualisation du logo actuel */}
        {settings.logo_url && (
          <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <img 
              src={settings.logo_url}
              alt="Logo actuel"
              className={`h-16 w-16 object-cover ${settings.logo_shape === 'round' ? 'rounded-full' : 'rounded-lg'}`}
              onError={(e) => {
                e.currentTarget.src = "/club-logo.png";
              }}
            />
            <div>
              <p className="text-white font-medium">Logo actuel</p>
              <p className="text-sm text-gray-400">Forme: {settings.logo_shape === 'round' ? 'Rond' : 'Carré'}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="logo-upload" className="text-white">
            Nouveau logo (512x512 pixels)
          </Label>
          <Input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpg,image/jpeg"
            onChange={onFileSelect}
            disabled={uploading}
            className="bg-gray-700 text-white"
            aria-label="Télécharger le logo principal"
          />
          <p className="text-xs text-gray-400">
            Formats supportés : PNG, JPG, JPEG. L'image doit être carrée (512x512px) pour un résultat optimal.
          </p>

          {previewUrl && (
            <div className="mt-3 p-4 bg-gray-700 rounded-lg flex items-center gap-4">
              <img
                src={previewUrl}
                alt="Aperçu du nouveau logo"
                className={`h-16 w-16 object-cover ${settings.logo_shape === 'round' ? 'rounded-full' : 'rounded-lg'}`}
              />
              <div className="flex items-center gap-3">
                <Button onClick={handleUploadClick} disabled={uploading} aria-label="Enregistrer le logo">
                  {uploading ? 'Enregistrement...' : 'Enregistrer le logo'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  disabled={uploading}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo-shape" className="text-white">
            Forme du logo
          </Label>
          <Select 
            value={settings.logo_shape} 
            onValueChange={(value) => onSettingChange("logo_shape", value)}
          >
            <SelectTrigger className="bg-gray-700 text-white border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round">Rond</SelectItem>
              <SelectItem value="square">Carré</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {uploading && (
          <div className="flex items-center justify-center space-x-2 p-4 bg-blue-900/20 rounded-lg">
            <ArrowUp className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-blue-400">Téléversement du logo en cours...</span>
          </div>
        )}

        {uploadResults && !uploading && (
          <div className="p-4 bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-400 font-medium">Génération terminée</span>
            </div>
            <p className="text-sm text-gray-300">
              {uploadResults.successful?.length || 0} formats générés avec succès
            </p>
            {uploadResults.failed?.length > 0 && (
              <p className="text-sm text-red-400 mt-1">
                {uploadResults.failed.length} formats ont échoué
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};