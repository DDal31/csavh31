import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminSettingsPresentation from "@/pages/AdminPresentation";
import AdminSettingsContacts from "@/pages/AdminContacts";
import AdminSettingsNews from "@/pages/AdminNews";
import AdminSettingsSportsTeams from "@/pages/AdminSportsTeams";
import AdminSettingsDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminSettingsAttendanceSheets from "@/pages/AdminAttendanceSheets";
import AdminSiteSettings from "@/pages/AdminSiteSettings";

export const AdminSettingsRoutes = () => {
  return (
    <>
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