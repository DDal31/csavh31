import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { BackButton } from "@/components/training/BackButton";
import type { Training } from "@/types/training";
import type { SportType } from "@/types/profile";

const Attendance = () => {
  const navigate = useNavigate();

  // Query to get user's sport preference
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("sport")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return profile;
    },
  });

  // Query to get filtered trainings
  const { data: trainings, isLoading } = useQuery({
    queryKey: ["future-trainings", userProfile?.sport],
    queryFn: async () => {
      console.log("Fetching future trainings for sport:", userProfile?.sport);
      if (!userProfile) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: trainingsData, error: trainingsError } = await supabase
        .from("trainings")
        .select(`
          *,
          registrations!inner (
            id,
            user_id,
            training_id,
            created_at,
            profiles!inner (
              first_name,
              last_name,
              club_role
            )
          )
        `)
        .gte("date", today.toISOString())
        .order("date", { ascending: true })
        .or(
          userProfile.sport === 'both' 
            ? `type.in.(goalball,torball,other)` 
            : `type.in.(${userProfile.sport},other)`
        );

      if (trainingsError) {
        console.error("Error fetching trainings:", trainingsError);
        throw trainingsError;
      }

      console.log("Fetched trainings:", trainingsData);
      return trainingsData as Training[];
    },
    enabled: !!userProfile?.sport,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <BackButton />
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-8 sm:mb-12">
            Présence aux entraînements
          </h1>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : trainings && trainings.length > 0 ? (
            <div className="grid gap-4 sm:gap-6">
              {trainings.map((training) => (
                <AttendanceCard 
                  key={training.id} 
                  training={training}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 p-8">
              Aucun entraînement disponible pour votre sport.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Attendance;