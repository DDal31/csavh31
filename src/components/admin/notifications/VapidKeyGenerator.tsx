import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function VapidKeyGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);

  const generateKeys = async () => {
    setIsGenerating(true);
    try {
      console.log("Calling generate-vapid-keys function...");
      const { data, error } = await supabase.functions.invoke("generate-vapid-keys");
      
      if (error) {
        console.error("Error generating VAPID keys:", error);
        throw error;
      }

      console.log("VAPID keys generated:", {
        publicKeyLength: data.publicKey.length,
        privateKeyLength: data.privateKey.length
      });
      
      setKeys(data);
    } catch (error) {
      console.error("Failed to generate VAPID keys:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <Button 
        onClick={generateKeys}
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          "Générer de nouvelles clés VAPID"
        )}
      </Button>

      {keys && (
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Clé publique :</h3>
            <div className="p-2 bg-gray-900 rounded text-xs break-all">
              {keys.publicKey}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-200 mb-1">Clé privée :</h3>
            <div className="p-2 bg-gray-900 rounded text-xs break-all">
              {keys.privateKey}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            Copiez ces clés et mettez-les à jour dans les secrets des fonctions Edge de Supabase.
          </p>
        </div>
      )}
    </div>
  );
}