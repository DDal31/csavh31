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
        path="presentation"
        element={
          <ProtectedRoute requireAdmin>
            <AdminPresentation />
          </ProtectedRoute>
        }
      />
      <Route
        path="contacts"
        element={
          <ProtectedRoute requireAdmin>
            <AdminContacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="news"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNews />
          </ProtectedRoute>
        }
      />
      <Route
        path="sports-teams"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSportsTeams />
          </ProtectedRoute>
        }
      />
      <Route
        path="document-types"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDocumentTypes />
          </ProtectedRoute>
        }
      />
      <Route
        path="attendance-sheets"
        element={
          <ProtectedRoute requireAdmin>
            <AdminAttendanceSheets />
          </ProtectedRoute>
        }
      />
      <Route
        path="site"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSiteSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="notifications"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNotificationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="templates"
        element={
          <ProtectedRoute requireAdmin>
            <AdminTemplates />
          </ProtectedRoute>
        }
      />
    </>
  );
};