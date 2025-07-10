
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasswordChangeSectionProps {
  userId: string;
  userName: string;
}

export function PasswordChangeSection({ userId, userName }: PasswordChangeSectionProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Changing password for user:", userId);
      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          method: 'UPDATE_PASSWORD',
          userId,
          newPassword
        }
      });

      if (error) throw error;

      console.log("Password changed successfully");
      toast({
        title: "Succès",
        description: "Le mot de passe a été modifié avec succès",
      });
      
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mot de passe",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Modifier le mot de passe de {userName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-password" className="text-gray-300">
            Nouveau mot de passe
          </Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Entrez le nouveau mot de passe"
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-300">
            Confirmer le mot de passe
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmez le nouveau mot de passe"
            className="bg-gray-700 text-white border-gray-600"
          />
        </div>
        <Button
          onClick={handlePasswordChange}
          disabled={isLoading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isLoading ? "Modification..." : "Modifier le mot de passe"}
        </Button>
      </CardContent>
    </Card>
  );
}
