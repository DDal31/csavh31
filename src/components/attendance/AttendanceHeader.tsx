import { BackButton } from "../training/BackButton";

export function AttendanceHeader() {
  return (
    <>
      <BackButton />
      <h1 className="text-4xl font-bold text-center mb-12 text-white">
        Présence aux entraînements
      </h1>
    </>
  );
}