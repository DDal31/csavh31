import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrainingList } from "@/components/training/TrainingList";
import { BackButton } from "@/components/training/BackButton";
import type { Training } from "@/types/training";

const TrainingRegistration = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedTrainings, setSelectedTrainings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrainingsAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setUserProfile(profile);

        // Fetch trainings with registrations and profiles
        const { data: trainingsData, error: trainingsError } = await supabase
          .from("trainings")
          .select(`
            *,
            registrations (
              id,
              user_id,
              created_at,
              training_id,
              profiles (
                first_name,
                last_name,
                club_role
              )
            )
          `)
          .gte("date", new Date().toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (trainingsError) throw trainingsError;

        console.log("Fetched trainings:", trainingsData);
        setTrainings(trainingsData);

        // Fetch user's current registrations
        const { data: registrations, error: registrationsError } = await supabase
          .from("registrations")
          .select("training_id")
          .eq("user_id", session.user.id);

        if (registrationsError) throw registrationsError;

        setSelectedTrainings(registrations.map(reg => reg.training_id));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
        setLoading(false);
      }
    };

    fetchTrainingsAndProfile();
  }, [navigate, toast]);

  const toggleTrainingSelection = (trainingId: string) => {
    setSelectedTrainings(prev => 
      prev.includes(trainingId) 
        ? prev.filter(id => id !== trainingId)
        : [...prev, trainingId]
    );
  };

  const handleSaveRegistrations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Get current registrations
      const { data: currentRegistrations } = await supabase
        .from("registrations")
        .select("training_id")
        .eq("user_id", session.user.id);

      const currentRegistrationIds = currentRegistrations?.map(reg => reg.training_id) || [];

      // Trainings to add (selected but not currently registered)
      const trainingsToAdd = selectedTrainings.filter(
        trainingId => !currentRegistrationIds.includes(trainingId)
      );

      // Trainings to remove (currently registered but not selected)
      const trainingsToRemove = currentRegistrationIds.filter(
        trainingId => !selectedTrainings.includes(trainingId)
      );

      // Add new registrations
      if (trainingsToAdd.length > 0) {
        const registrationsToInsert = trainingsToAdd.map(trainingId => ({
          training_id: trainingId,
          user_id: session.user.id
        }));

        const { error: insertError } = await supabase
          .from("registrations")
          .insert(registrationsToInsert);

        if (insertError) throw insertError;
      }

      // Remove old registrations
      if (trainingsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("registrations")
          .delete()
          .eq("user_id", session.user.id)
          .in("training_id", trainingsToRemove);

        if (deleteError) throw deleteError;
      }

      toast({
        title: "Succès",
        description: "Vos inscriptions ont été mises à jour",
        variant: "default"
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des inscriptions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour vos inscriptions",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
          <BackButton />
          <h1 className="text-4xl font-bold text-center mb-12 text-white">
            Inscriptions aux Entraînements
          </h1>

          <TrainingList 
            trainings={trainings}
            selectedTrainings={selectedTrainings}
            onTrainingToggle={toggleTrainingSelection}
          />
          
          <Button 
            onClick={handleSaveRegistrations} 
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
          >
            Valider mes inscriptions
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrainingRegistration;
