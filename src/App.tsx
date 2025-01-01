import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import Actualites from "@/pages/Actualites";
import NewsArticle from "@/pages/NewsArticle";
import Presentation from "@/pages/Presentation";
import Contact from "@/pages/Contact";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import ChangePassword from "@/pages/ChangePassword";
import Training from "@/pages/Training";
import Attendance from "@/pages/Attendance";
import Documents from "@/pages/Documents";

// Admin pages
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminUserEdit from "@/pages/AdminUserEdit";
import AdminNews from "@/pages/AdminNews";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import AdminNewsEdit from "@/pages/AdminNewsEdit";
import AdminPresentation from "@/pages/AdminPresentation";
import AdminContacts from "@/pages/AdminContacts";
import AdminSportsTeams from "@/pages/AdminSportsTeams";
import AdminSportCreate from "@/pages/AdminSportCreate";
import AdminTeamCreate from "@/pages/AdminTeamCreate";
import AdminTrainings from "@/pages/AdminTrainings";
import AdminDocuments from "@/pages/AdminDocuments";
import AdminDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminAttendanceSheets from "@/pages/AdminAttendanceSheets";
import AdminSettings from "@/pages/AdminSettings";
import AdminSiteSettings from "@/pages/AdminSiteSettings";

// Admin Settings pages
import AdminSettingsPresentation from "@/pages/AdminPresentation";
import AdminSettingsContacts from "@/pages/AdminContacts";
import AdminSettingsNews from "@/pages/AdminNews";
import AdminSettingsSportsTeams from "@/pages/AdminSportsTeams";
import AdminSettingsDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminSettingsAttendanceSheets from "@/pages/AdminAttendanceSheets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/actualites" element={<Actualites />} />
          <Route path="/actualites/:id" element={<NewsArticle />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected member routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <Training />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />

          {/* Protected admin routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUserEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news/create"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/news/:id"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/presentation"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPresentation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute requireAdmin>
                <AdminContacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sports"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSportsTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sports/create"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSportCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams/create"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTeamCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trainings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTrainings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDocuments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/document-types"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDocumentTypes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAttendanceSheets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/site"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSiteSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin Settings Routes */}
          <Route
            path="/admin/settings/presentation"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsPresentation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/contacts"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsContacts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/news"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsNews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/sports-teams"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsSportsTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/document-types"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsDocumentTypes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/attendance-sheets"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsAttendanceSheets />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;