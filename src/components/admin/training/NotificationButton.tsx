import { useState } from "react";
import { Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/types/training";

interface NotificationButtonProps {
  training: Training;
}

export function NotificationButton({ training }: NotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async () => {
    try {
      setSending(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('send-notification', {
        body: {
          title,
          body,
          trainingId: training.id,
          userId: session.user.id,
        },
      });

      if (error) throw error;

      toast({
        title: "Notification envoyée",
        description: "La notification a été envoyée avec succès.",
      });
      setOpen(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la notification.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="text-white hover:bg-gray-600"
          aria-label="Envoyer une notification"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Envoyer une notification</DialogTitle>
          <DialogDescription>
            Envoyez une notification aux utilisateurs inscrits à cet entraînement.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titre
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la notification"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="body" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Contenu de la notification"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSendNotification}
            disabled={sending || !title || !body}
          >
            {sending ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}