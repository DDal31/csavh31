import { AdminAttendanceCharts } from "@/components/admin/attendance/AdminAttendanceCharts";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">
        Tableau de bord administrateur
      </h1>
      <AdminAttendanceCharts />
    </div>
  );
}