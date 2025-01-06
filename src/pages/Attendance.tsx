import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceHeader } from "@/components/attendance/AttendanceHeader";
import { Loader2 } from "lucide-react";
import type { Training } from "@/types/training";

const Attendance = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSports, setUserSports] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserSportsAndTrainings = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          throw new Error("No user session found");
        }

        // Get user's sports from profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("sport")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        // Handle multiple sports in the sport field
        const sports = profileData.sport
          .split(",")
          .map((sport: string) => sport.trim().toLowerCase());
        
        console.log("User sports:", sports);
        setUserSports(sports);

        // Get trainings for user's sports
        const today = new Date().toISOString().split('T')[0];
        const { data: trainingsData, error: trainingsError } = await supabase
          .from("trainings")
          .select(`
            *,
            registrations (
              id,
              user_id,
              created_at,
              profiles (
                first_name,
                last_name,
                club_role
              )
            )
          `)
          .gte("date", today)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true });

        if (trainingsError) throw trainingsError;

        // Filter trainings based on user's sports
        const filteredTrainings = trainingsData.filter((training) => {
          const trainingType = training.type.toLowerCase();
          return sports.some(sport => 
            sport === trainingType || 
            (sport === "both" && (trainingType === "goalball" || trainingType === "torball"))
          );
        });

        console.log("Filtered trainings:", filteredTrainings);
        setTrainings(filteredTrainings as Training[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSportsAndTrainings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <AttendanceHeader />
        <div className="max-w-3xl mx-auto text-center text-white">
          Aucun entraînement à venir pour vos sports ({userSports.join(", ")})
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <AttendanceHeader />
        <div className="space-y-6">
          {trainings.map((training) => (
            <AttendanceCard key={training.id} training={training} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Attendance;