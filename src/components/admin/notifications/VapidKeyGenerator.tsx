import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export function VapidKeyGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<"public" | "private" | null>(null);

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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les clés VAPID. Veuillez réessayer.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, keyType: "public" | "private") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyType);
      toast({
        title: "Copié !",
        description: `La clé ${keyType === "public" ? "publique" : "privée"} a été copiée dans le presse-papiers.`,
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier la clé. Veuillez réessayer.",
      });
    }
  };

  const openSupabaseSecrets = () => {
    window.open("https://supabase.com/dashboard/project/kzahxvazbthyjjzugxsy/settings/functions", "_blank");
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Configuration des clés VAPID</h2>
        <p className="text-sm text-gray-300">
          Les clés VAPID sont nécessaires pour l'envoi des notifications push. Suivez ces étapes :
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 ml-4">
          <li>Générez de nouvelles clés en cliquant sur le bouton ci-dessous</li>
          <li>Copiez les clés générées en utilisant les boutons de copie</li>
          <li>
            Ajoutez-les dans les secrets des fonctions Edge de Supabase :
            <Button
              variant="link"
              size="sm"
              className="text-purple-300 hover:text-purple-200 pl-2"
              onClick={openSupabaseSecrets}
            >
              Ouvrir les secrets Supabase <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </li>
          <li>Dans Supabase, ajoutez deux secrets :</li>
          <ul className="list-disc list-inside ml-4 text-gray-400">
            <li>VAPID_PUBLIC_KEY : collez la clé publique</li>
            <li>VAPID_PRIVATE_KEY : collez la clé privée</li>
          </ul>
        </ol>
      </div>

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
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-200">Clé publique :</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white hover:bg-purple-800/50"
                onClick={() => copyToClipboard(keys.publicKey, "public")}
                aria-label="Copier la clé publique"
              >
                {copiedKey === "public" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-2 bg-gray-900 rounded text-xs break-all">
              {keys.publicKey}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-medium text-gray-200">Clé privée :</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-300 hover:text-white hover:bg-purple-800/50"
                onClick={() => copyToClipboard(keys.privateKey, "private")}
                aria-label="Copier la clé privée"
              >
                {copiedKey === "private" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="p-2 bg-gray-900 rounded text-xs break-all">
              {keys.privateKey}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}