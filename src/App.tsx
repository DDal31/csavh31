import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Contact from "@/pages/Contact";
import Presentation from "@/pages/Presentation";
import Actualites from "@/pages/Actualites";
import NewsArticle from "@/pages/NewsArticle";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import Training from "@/pages/Training";
import Attendance from "@/pages/Attendance";
import Documents from "@/pages/Documents";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminUserEdit from "@/pages/AdminUserEdit";
import AdminNews from "@/pages/AdminNews";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import AdminNewsEdit from "@/pages/AdminNewsEdit";
import AdminTrainings from "@/pages/AdminTrainings";
import AdminDocuments from "@/pages/AdminDocuments";
import AdminDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminAttendanceSheets from "@/pages/AdminAttendanceSheets";
import AdminContacts from "@/pages/AdminContacts";
import AdminPresentation from "@/pages/AdminPresentation";
import AdminSettings from "@/pages/AdminSettings";
import AdminSportsTeams from "@/pages/AdminSportsTeams";
import AdminSportCreate from "@/pages/AdminSportCreate";
import AdminTeamCreate from "@/pages/AdminTeamCreate";
import ResetPassword from "@/pages/ResetPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import ChangePassword from "@/pages/ChangePassword";
import BlogPost from "@/pages/BlogPost";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/actualites/:id" element={<NewsArticle />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* Member routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/training" element={<Training />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserEdit />} />
          <Route path="/admin/news" element={<AdminNews />} />
          <Route path="/admin/news/create" element={<AdminNewsCreate />} />
          <Route path="/admin/news/:id" element={<AdminNewsEdit />} />
          <Route path="/admin/trainings" element={<AdminTrainings />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/document-types" element={<AdminDocumentTypes />} />
          <Route path="/admin/attendance-sheets" element={<AdminAttendanceSheets />} />
          <Route path="/admin/contacts" element={<AdminContacts />} />
          <Route path="/admin/presentation" element={<AdminPresentation />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/settings/sports-teams" element={<AdminSportsTeams />} />
          <Route path="/admin/settings/sports-teams/add-sport" element={<AdminSportCreate />} />
          <Route path="/admin/settings/sports-teams/add-team" element={<AdminTeamCreate />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;