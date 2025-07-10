
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PasswordChangeDialogProps {
  userId: string;
  userName: string;
}

export function PasswordChangeDialog({ userId, userName }: PasswordChangeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-yellow-600 hover:bg-yellow-700 text-white border-none w-full sm:w-auto flex items-center justify-center gap-2"
          aria-label={`Modifier le mot de passe de ${userName}`}
          title={`Modifier le mot de passe de ${userName}`}
        >
          <KeyRound className="h-4 w-4" />
          <span className="sm:hidden">Mot de passe</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Modifier le mot de passe de {userName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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
              aria-describedby="password-requirements"
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
          <p id="password-requirements" className="text-sm text-gray-400">
            Le mot de passe doit contenir au moins 6 caractères
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
              aria-label="Annuler la modification du mot de passe"
            >
              Annuler
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              aria-label={isLoading ? "Modification en cours..." : `Confirmer la modification du mot de passe de ${userName}`}
            >
              {isLoading ? "Modification..." : "Modifier le mot de passe"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
