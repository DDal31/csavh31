import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminSiteSettings from "@/pages/AdminSiteSettings";
import AdminNewsCreate from "@/pages/AdminNewsCreate";
import AdminNewsEdit from "@/pages/AdminNewsEdit";
import AdminSettingsSportsTeams from "@/pages/AdminSportsTeams";
import AdminSportCreate from "@/pages/AdminSportCreate";
import AdminTeamCreate from "@/pages/AdminTeamCreate";
import AdminSettingsDocumentTypes from "@/pages/AdminDocumentTypes";
import AdminSettingsAttendanceSheets from "@/pages/AdminAttendanceSheets";
import AdminSettingsPresentation from "@/pages/AdminPresentation";
import AdminSettingsNotifications from "@/pages/AdminNotifications";
import AdminNews from "@/pages/AdminNews";
import AdminContacts from "@/pages/AdminContacts";

export const AdminSettingsRoutes = (
  <>
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
      path="/admin/settings/news/edit/:id"
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
    <Route
      path="/admin/settings/notifications"
      element={
        <ProtectedRoute requireAdmin>
          <AdminSettingsNotifications />
        </ProtectedRoute>
      }
    />
  </>
);