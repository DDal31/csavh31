import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminUserEdit from "@/pages/AdminUserEdit";
import AdminTrainings from "@/pages/AdminTrainings";
import AdminDocuments from "@/pages/AdminDocuments";
import AdminSettings from "@/pages/AdminSettings";
import AdminNotifications from "@/pages/AdminNotifications";

export const AdminRoutes = () => {
  return (
    <>
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
        path="/admin/users/:id"
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
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requireAdmin>
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
    </>
  );
}