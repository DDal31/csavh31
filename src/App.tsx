
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/animations/PageTransition";
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

// Member pages
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
import AdminTrainings from "@/pages/AdminTrainings";
import AdminDocuments from "@/pages/AdminDocuments";
import AdminSettings from "@/pages/AdminSettings";

// Admin settings pages
import AdminSiteSettings from "@/pages/AdminSiteSettings";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import AdminNewsEdit from "@/pages/AdminNewsEdit";
import AdminSettingsSportsTeams from "@/pages/AdminSportsTeams";
import AdminSportCreate from "@/pages/AdminSportCreate";
import AdminTeamCreate from "@/pages/AdminTeamCreate";
import AdminSettingsDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminSettingsAttendanceSheets from "@/pages/AdminAttendanceSheets";
import AdminSettingsPresentation from "@/pages/AdminPresentation";
import AdminNews from "@/pages/AdminNews";
import AdminContacts from "@/pages/AdminContacts";
import { AdminChampionships } from "@/pages/AdminChampionships";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route index element={<Index />} />
          <Route path="login" element={<Login />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="update-password" element={<UpdatePassword />} />
          <Route path="actualites" element={<Actualites />} />
          <Route path="actualites/:id" element={<NewsArticle />} />
          <Route path="presentation" element={<Presentation />} />
          <Route path="contact" element={<Contact />} />

          {/* Member Routes */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="training"
            element={
              <ProtectedRoute>
                <Training />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
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
            path="/admin/championships"
            element={
              <ProtectedRoute requireAdmin>
                <AdminChampionships />
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

          {/* Admin Settings Routes */}
          <Route
            path="/admin/settings/site"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSiteSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/news"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/news/create"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/news/:id/edit"
            element={
              <ProtectedRoute requireAdmin>
                <AdminNewsEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/contacts"
            element={
              <ProtectedRoute requireAdmin>
                <AdminContacts />
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
            path="/admin/settings/sports-teams/add-sport"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSportCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings/sports-teams/add-team"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTeamCreate />
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
          <Route
            path="/admin/settings/presentation"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettingsPresentation />
              </ProtectedRoute>
            }
          />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AnimatedRoutes />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
