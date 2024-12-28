import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { Loader2 } from "lucide-react";
import type { Training } from "@/types/training";

const Attendance = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const { data, error } = await supabase
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
          .order('date', { ascending: false })
          .limit(10);

        if (error) throw error;

        console.log("Fetched trainings:", data);
        setTrainings(data as Training[]);
      } catch (error) {
        console.error("Error fetching trainings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainings();
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
        <div className="max-w-3xl mx-auto text-center text-white">
          Aucun entraînement trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {trainings.map((training) => (
          <AttendanceCard key={training.id} training={training} />
        ))}
      </div>
    </div>
  );
};

export default Attendance;