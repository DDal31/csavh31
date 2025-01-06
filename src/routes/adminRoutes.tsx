import { lazy } from "react";
import { adminSettingsRoutes } from "./adminSettingsRoutes";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminUserEdit = lazy(() => import("@/pages/AdminUserEdit"));
const AdminTrainings = lazy(() => import("@/pages/AdminTrainings"));
const AdminTrainingNotification = lazy(() => import("@/pages/AdminTrainingNotification"));

export const adminRoutes = [
  {
    path: "dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "users",
    element: <AdminUsers />,
  },
  {
    path: "users/:id/edit",
    element: <AdminUserEdit />,
  },
  {
    path: "trainings",
    element: <AdminTrainings />,
  },
  {
    path: "trainings/:id/notify",
    element: <AdminTrainingNotification />,
  },
  ...adminSettingsRoutes,
];

export default adminRoutes;