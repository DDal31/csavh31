import { useParams } from "react-router-dom";
import { useTraining } from "@/components/training/useTraining";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";

const Attendance = () => {
  const { trainingId } = useParams();
  const { training, isLoading } = useTraining(trainingId);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 p-6">Chargement...</div>;
  }

  if (!training) {
    return <div className="min-h-screen bg-gray-900 p-6">Entraînement non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <AttendanceCard training={training} />
      </div>
    </div>
  );
};

export default Attendance;