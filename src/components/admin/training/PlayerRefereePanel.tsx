import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Training } from "@/types/training";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  club_role: string;
  sport: string;
};

type PlayerRefereePanelProps = {
  training: Training | null;
  isOpen: boolean;
  onClose: () => void;
};

export function PlayerRefereePanel({ training, isOpen, onClose }: PlayerRefereePanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("players");

  // Profiles query with sport filtering
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ["profiles", training?.type],
    queryFn: async () => {
      if (!training?.type) return [];
      
      console.log("Fetching profiles for sport:", training.type);
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      // Filter profiles based on sport
      const filteredProfiles = data.filter(profile => {
        const sports = profile.sport.toLowerCase().split(',').map(s => s.trim());
        return sports.includes(training.type.toLowerCase());
      });

      console.log("Filtered profiles:", filteredProfiles);
      return filteredProfiles as Profile[];
    },
    enabled: isOpen && !!training?.type,
  });

  // Registrations query
  const { data: registrations = [], isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["registrations", training?.id],
    queryFn: async () => {
      if (!training?.id) return [];

      const { data, error } = await supabase
        .from("registrations")
        .select("user_id")
        .eq("training_id", training.id);

      if (error) throw error;
      return data.map(reg => reg.user_id);
    },
    enabled: isOpen && !!training?.id,
  });

  // Registration mutation
  const toggleRegistration = useMutation({
    mutationFn: async (userId: string) => {
      if (!training?.id) return;
      
      const isRegistered = registrations.includes(userId);
      
      if (isRegistered) {
        const { error } = await supabase
          .from("registrations")
          .delete()
          .eq("training_id", training.id)
          .eq("user_id", userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("registrations")
          .insert({ training_id: training.id, user_id: userId });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations", training?.id] });
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
      toast({
        title: "Succès",
        description: "L'inscription a été mise à jour",
      });
    },
    onError: (error) => {
      console.error("Error toggling registration:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'inscription",
        variant: "destructive",
      });
    },
  });

  const filteredProfiles = profiles.filter(profile => {
    if (selectedTab === "players") {
      return ["joueur", "joueur-entraineur", "joueur-arbitre", "les-trois"].includes(profile.club_role);
    } else {
      return ["arbitre", "joueur-arbitre", "entraineur-arbitre", "les-trois"].includes(profile.club_role);
    }
  });

  const isLoading = isLoadingProfiles || isLoadingRegistrations;

  if (!training) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-[540px] bg-gray-900 text-white">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p>Une erreur est survenue lors du chargement de l'entraînement.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[540px] bg-gray-900 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">
            Ajouter des participants - {training.type.charAt(0).toUpperCase() + training.type.slice(1)}
          </SheetTitle>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoaderCircle className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="players">Joueurs</TabsTrigger>
              <TabsTrigger value="referees">Arbitres</TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProfiles.length === 0 ? (
                  <p className="text-gray-400 col-span-2 text-center">
                    Aucun joueur disponible pour ce sport
                  </p>
                ) : (
                  filteredProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant={registrations.includes(profile.id) ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => toggleRegistration.mutate(profile.id)}
                      aria-label={`${registrations.includes(profile.id) ? "Désinscrire" : "Inscrire"} ${profile.first_name} ${profile.last_name}`}
                    >
                      {profile.first_name} {profile.last_name}
                    </Button>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="referees" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProfiles.length === 0 ? (
                  <p className="text-gray-400 col-span-2 text-center">
                    Aucun arbitre disponible pour ce sport
                  </p>
                ) : (
                  filteredProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant={registrations.includes(profile.id) ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => toggleRegistration.mutate(profile.id)}
                      aria-label={`${registrations.includes(profile.id) ? "Désinscrire" : "Inscrire"} ${profile.first_name} ${profile.last_name}`}
                    >
                      {profile.first_name} {profile.last_name}
                    </Button>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}