import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTraining } from "@/components/training/useTrainings";
import { useTrainingRegistration } from "@/components/training/useTrainingRegistration";
import { AttendanceCard } from "@/components/attendance/AttendanceCard";
import { AttendanceGraph } from "@/components/attendance/AttendanceGraph";
import { ParticipantsList } from "@/components/attendance/ParticipantsList";
import type { Profile } from "@/types/profile";

const Attendance = () => {
  const { trainingId } = useParams();
  const { training, isLoading: isLoadingTraining } = useTraining(trainingId);
  const { registrations, isLoading: isLoadingRegistrations } = useTrainingRegistration(trainingId);

  if (isLoadingTraining || isLoadingRegistrations) {
    return <div>Loading...</div>;
  }

  if (!training) {
    return <div>Training not found</div>;
  }

  return (
    <div>
      <h1>{training.title}</h1>
      <AttendanceGraph trainingId={trainingId} />
      <ParticipantsList registrations={registrations} />
      <AttendanceCard training={training} />
    </div>
  );
};

export default Attendance;
