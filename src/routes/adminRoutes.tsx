import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminUserEdit from "@/pages/AdminUserEdit";
import AdminSettings from "@/pages/AdminSettings";
import { AdminSettingsRoutes } from "./adminSettingsRoutes";

export const AdminRoutes = () => {
  return (
    <>
      <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/users/:userId/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminUserEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route path="admin/*">
        <AdminSettingsRoutes />
      </Route>
    </>
  );
};