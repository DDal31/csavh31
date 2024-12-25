import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { BackButton } from "@/components/training/BackButton";

const Attendance = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: trainings, isLoading } = useQuery({
    queryKey: ["future-trainings"],
    queryFn: async () => {
      console.log("Fetching future trainings...");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: trainingsData, error: trainingsError } = await supabase
        .from("trainings")
        .select(`
          *,
          registrations (
            id,
            user_id,
            created_at,
            user:user_id (
              profiles (
                first_name,
                last_name,
                club_role
              )
            )
          )
        `)
        .gte("date", today.toISOString())
        .order("date", { ascending: true });

      if (trainingsError) {
        console.error("Error fetching trainings:", trainingsError);
        throw trainingsError;
      }

      // Transform the data to match the expected format
      const transformedTrainings = trainingsData.map(training => ({
        ...training,
        registrations: training.registrations.map(reg => ({
          id: reg.id,
          user_id: reg.user_id,
          created_at: reg.created_at,
          profiles: reg.user.profiles
        }))
      }));

      console.log("Fetched trainings:", transformedTrainings);
      return transformedTrainings;
    },
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <BackButton />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-12">
            Présence aux entraînements
          </h1>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          ) : (
            <div className="grid gap-6">
              {trainings?.map((training) => (
                <AttendanceCard 
                  key={training.id} 
                  training={training}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Attendance;