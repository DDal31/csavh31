import { Route } from "react-router-dom";
import AdminSettings from "@/pages/AdminSettings";
import AdminSettingsContacts from "@/pages/AdminContacts";
import AdminSettingsNews from "@/pages/AdminNews";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import AdminNewsEdit from "@/pages/AdminNewsEdit";
import AdminSettingsSportsTeams from "@/pages/AdminSportsTeams";
import AdminSportCreate from "@/pages/AdminSportCreate";
import AdminSettingsDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminSettingsAttendanceSheets from "@/pages/AdminAttendanceSheets";
import AdminSettingsPresentation from "@/pages/AdminPresentation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const AdminSettingsRoutes = () => {
  return (
    <>
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSettings />
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
    </>
  );
};