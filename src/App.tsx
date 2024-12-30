import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

// Create a client
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = "member" }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (requiredRole === "admin") {
          setIsAuthorized(profile?.site_role === "admin");
        } else {
          setIsAuthorized(!!profile);
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

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
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          } />
          <Route path="/training" element={
            <ProtectedRoute>
              <Training />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUserEdit />
            </ProtectedRoute>
          } />
          <Route path="/admin/news" element={
            <ProtectedRoute requiredRole="admin">
              <AdminNews />
            </ProtectedRoute>
          } />
          <Route path="/admin/news/create" element={
            <ProtectedRoute requiredRole="admin">
              <AdminNewsCreate />
            </ProtectedRoute>
          } />
          <Route path="/admin/news/:id" element={
            <ProtectedRoute requiredRole="admin">
              <AdminNewsEdit />
            </ProtectedRoute>
          } />
          <Route path="/admin/trainings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTrainings />
            </ProtectedRoute>
          } />
          <Route path="/admin/documents" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDocuments />
            </ProtectedRoute>
          } />
          <Route path="/admin/document-types" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDocumentTypes />
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance-sheets" element={
            <ProtectedRoute requiredRole="admin">
              <AdminAttendanceSheets />
            </ProtectedRoute>
          } />
          <Route path="/admin/contacts" element={
            <ProtectedRoute requiredRole="admin">
              <AdminContacts />
            </ProtectedRoute>
          } />
          <Route path="/admin/presentation" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPresentation />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings/sports-teams" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSportsTeams />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings/sports-teams/add-sport" element={
            <ProtectedRoute requiredRole="admin">
              <AdminSportCreate />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings/sports-teams/add-team" element={
            <ProtectedRoute requiredRole="admin">
              <AdminTeamCreate />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;