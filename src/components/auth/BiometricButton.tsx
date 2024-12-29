import { Button } from "@/components/ui/button";
import { Fingerprint } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BiometricButtonProps {
  onSuccess: (email: string, password: string) => Promise<void>;
  className?: string;
}

export const BiometricButton = ({ onSuccess, className = "" }: BiometricButtonProps) => {
  const { toast } = useToast();
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  const handleBiometricLogin = async () => {
    try {
      console.log("Starting biometric authentication...");
      console.log("Device is iOS:", isIOS);
      
      // Get authentication options from server
      const { data: optionsResponse, error: optionsError } = await supabase.functions.invoke(
        'get-auth-options',
        {
          method: 'POST',
          body: {}
        }
      );

      if (optionsError) {
        console.error("Error getting auth options:", optionsError);
        throw optionsError;
      }

      console.log("Got auth options:", optionsResponse);

      // Start the authentication process
      const asseResp = await startAuthentication(optionsResponse);
      console.log("Authentication response:", asseResp);
      
      // Verify with server
      const { data: verificationResponse, error: verificationError } = await supabase.functions.invoke(
        'verify-auth',
        {
          method: 'POST',
          body: { credential: asseResp }
        }
      );

      if (verificationError) {
        console.error("Verification error:", verificationError);
        throw verificationError;
      }

      console.log("Verification response:", verificationResponse);

      if (verificationResponse.verified) {
        await onSuccess(verificationResponse.email, verificationResponse.password);
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      
      let errorMessage = "Veuillez utiliser votre email et mot de passe pour vous connecter.";
      
      // Messages d'erreur spécifiques pour iOS
      if (error instanceof Error) {
        if (isIOS) {
          if (error.name === "NotAllowedError") {
            errorMessage = "Face ID n'est pas disponible. Vérifiez que Face ID est activé dans les paramètres de Safari.";
          } else if (error.name === "NotSupportedError") {
            errorMessage = "Face ID n'est pas configuré sur cet appareil. Vérifiez vos paramètres iOS.";
          } else if (error.name === "SecurityError") {
            errorMessage = "La connexion n'est pas sécurisée. Assurez-vous d'utiliser HTTPS.";
          }
        }
      }
      
      toast({
        title: "Erreur d'authentification biométrique",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleBiometricLogin}
      className={`w-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 ${className}`}
      aria-label="Se connecter avec l'authentification biométrique"
    >
      <Fingerprint className="h-5 w-5" />
      <span>{isIOS ? "Se connecter avec Face ID" : "Se connecter avec biométrie"}</span>
    </Button>
  );
};