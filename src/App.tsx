import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminSettings from "@/pages/AdminSettings";
import AdminTrainings from "@/pages/AdminTrainings";
import AdminAttendanceSheets from "@/pages/AdminAttendanceSheets";
import Dashboard from "@/pages/Dashboard";
import TrainingRegistration from "@/pages/Training";
import Login from "@/pages/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/trainings" element={<AdminTrainings />} />
        <Route path="/admin/settings/attendance-sheets" element={<AdminAttendanceSheets />} />
      </Routes>
    </Router>
  );
};

export default App;