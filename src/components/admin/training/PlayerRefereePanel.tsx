import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/types/training";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  club_role: string;
};

type PlayerRefereePanelProps = {
  training: Training;
  isOpen: boolean;
  onClose: () => void;
};

export function PlayerRefereePanel({ training, isOpen, onClose }: PlayerRefereePanelProps) {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [referees, setReferees] = useState<Profile[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchParticipants();
      fetchRegistrations();
    }
  }, [isOpen, training.id]);

  const fetchParticipants = async () => {
    try {
      // Fetch players (excluding referees)
      const { data: playersData, error: playersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, club_role")
        .eq("sport", training.type)
        .in("club_role", ["joueur", "joueur-entraineur"]);

      if (playersError) throw playersError;
      setPlayers(playersData || []);

      // Fetch referees
      const { data: refereesData, error: refereesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, club_role")
        .eq("sport", training.type)
        .in("club_role", ["arbitre", "joueur-arbitre", "entraineur-arbitre", "les-trois"]);

      if (refereesError) throw refereesError;
      setReferees(refereesData || []);

    } catch (error) {
      console.error("Error fetching participants:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les participants",
        variant: "destructive",
      });
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("user_id")
        .eq("training_id", training.id);

      if (error) throw error;
      setRegisteredUsers(data.map(reg => reg.user_id));
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const toggleRegistration = async (userId: string) => {
    try {
      if (registeredUsers.includes(userId)) {
        // Remove registration
        const { error } = await supabase
          .from("registrations")
          .delete()
          .eq("training_id", training.id)
          .eq("user_id", userId);

        if (error) throw error;
        setRegisteredUsers(prev => prev.filter(id => id !== userId));
      } else {
        // Add registration
        const { error } = await supabase
          .from("registrations")
          .insert({ training_id: training.id, user_id: userId });

        if (error) throw error;
        setRegisteredUsers(prev => [...prev, userId]);
      }

      toast({
        title: "Succès",
        description: "Inscription mise à jour",
      });
    } catch (error) {
      console.error("Error toggling registration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'inscription",
        variant: "destructive",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[540px] bg-gray-900 border-gray-800">
        <SheetHeader className="space-y-4 mb-6">
          <SheetTitle className="text-2xl font-bold text-white flex items-center justify-between">
            Ajouter des participants
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
              aria-label="Fermer le panneau"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4">
          <div className="space-y-8">
            {/* Players Section */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Joueurs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.map((player) => (
                  <Button
                    key={player.id}
                    variant={registeredUsers.includes(player.id) ? "default" : "outline"}
                    className={`w-full justify-start ${
                      registeredUsers.includes(player.id)
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "hover:bg-gray-800"
                    }`}
                    onClick={() => toggleRegistration(player.id)}
                    aria-label={`${
                      registeredUsers.includes(player.id) ? "Désinscrire" : "Inscrire"
                    } ${player.first_name} ${player.last_name}`}
                  >
                    {player.first_name} {player.last_name}
                  </Button>
                ))}
              </div>
            </section>

            {/* Referees Section */}
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Arbitres</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {referees.map((referee) => (
                  <Button
                    key={referee.id}
                    variant={registeredUsers.includes(referee.id) ? "default" : "outline"}
                    className={`w-full justify-start ${
                      registeredUsers.includes(referee.id)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-gray-800"
                    }`}
                    onClick={() => toggleRegistration(referee.id)}
                    aria-label={`${
                      registeredUsers.includes(referee.id) ? "Désinscrire" : "Inscrire"
                    } ${referee.first_name} ${referee.last_name}`}
                  >
                    {referee.first_name} {referee.last_name}
                  </Button>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}