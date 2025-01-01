import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

export const AdminRoutes = () => {
  return (
    <>
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
    </>
  );
};