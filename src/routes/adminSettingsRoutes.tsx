import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminNotificationSettings from "@/pages/AdminNotificationSettings";
import AdminInstantNotifications from "@/pages/AdminInstantNotifications";

export const AdminSettingsRoutes = () => {
  return (
    <>
      <Route
        path="/admin/settings/notifications"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNotificationSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/notifications/instant"
        element={
          <ProtectedRoute requireAdmin>
            <AdminInstantNotifications />
          </ProtectedRoute>
        }
      />
    </>
  );
};

export const adminSettingsRoutes = [
  {
    path: "settings/notifications",
    element: <AdminNotificationSettings />,
  },
  {
    path: "settings/notifications/instant",
    element: <AdminInstantNotifications />,
  },
];

// Make sure both the component and routes array are exported
export default AdminSettingsRoutes;