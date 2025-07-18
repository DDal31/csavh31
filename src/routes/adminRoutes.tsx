import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminUserEdit from "@/pages/AdminUserEdit";
import AdminTrainings from "@/pages/AdminTrainings";
import AdminDocuments from "@/pages/AdminDocuments";
import AdminSettings from "@/pages/AdminSettings";
import AdminSportsTeams from "@/pages/AdminSportsTeams";
import AdminSportCreate from "@/pages/AdminSportCreate";
import AdminTeamCreate from "@/pages/AdminTeamCreate";
import { AdminChampionships } from "@/pages/AdminChampionships";

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
        path="/admin/users/:userId/edit"
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
        path="/admin/settings/sports-teams"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSportsTeams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/sports-teams/sport/create"
        element={
          <ProtectedRoute requireAdmin>
            <AdminSportCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings/sports-teams/team/create"
        element={
          <ProtectedRoute requireAdmin>
            <AdminTeamCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/championships"
        element={
          <ProtectedRoute requireAdmin>
            <AdminChampionships />
          </ProtectedRoute>
        }
      />
    </>
  );
}