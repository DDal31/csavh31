import { Route } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const AdminPresentation = lazy(() => import("@/pages/AdminPresentation"));
const AdminContacts = lazy(() => import("@/pages/AdminContacts"));
const AdminNews = lazy(() => import("@/pages/AdminNews"));
const AdminSportsTeams = lazy(() => import("@/pages/AdminSportsTeams"));
const AdminDocumentTypes = lazy(() => import("@/pages/AdminDocumentTypes"));
const AdminAttendanceSheets = lazy(() => import("@/pages/AdminAttendanceSheets"));
const AdminSiteSettings = lazy(() => import("@/pages/AdminSiteSettings"));
const AdminNotificationSettings = lazy(() => import("@/pages/AdminNotificationSettings"));
const AdminTemplates = lazy(() => import("@/pages/AdminTemplates"));

export const AdminSettingsRoutes = () => {
  return (
    <>
      <Route
        path="/admin/settings/presentation"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPresentation />
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
        path="/admin/settings/news"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/sports-teams"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSportsTeams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/document-types"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDocumentTypes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/attendance-sheets"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAttendanceSheets />
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
      <Route
        path="/admin/settings/notifications"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNotificationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/templates"
        element={
          <ProtectedRoute requireAdmin>
            <AdminTemplates />
          </ProtectedRoute>
        }
      />
    </>
  );
};