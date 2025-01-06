import { lazy } from "react";
import { adminSettingsRoutes } from "./adminSettingsRoutes";

const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminTrainings = lazy(() => import("@/pages/AdminTrainings"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminUserEdit = lazy(() => import("@/pages/AdminUserEdit"));
const AdminNews = lazy(() => import("@/pages/AdminNews"));
const AdminNewsCreate = lazy(() => import("@/pages/AdminNewsCreate"));
const AdminNewsEdit = lazy(() => import("@/pages/AdminNewsEdit"));
const AdminDocuments = lazy(() => import("@/pages/AdminDocuments"));
const AdminDocumentTypes = lazy(() => import("@/pages/AdminDocumentTypes"));
const AdminContacts = lazy(() => import("@/pages/AdminContacts"));
const AdminAttendanceSheets = lazy(() => import("@/pages/AdminAttendanceSheets"));
const AdminNotificationSettings = lazy(() => import("@/pages/AdminNotificationSettings"));
const AdminNotificationTemplates = lazy(() => import("@/pages/AdminNotificationTemplates"));
const AdminInstantNotifications = lazy(() => import("@/pages/AdminInstantNotifications"));
const AdminTrainingNotification = lazy(() => import("@/pages/AdminTrainingNotification"));

export const adminRoutes = [
  {
    path: "dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "trainings",
    element: <AdminTrainings />,
  },
  {
    path: "trainings/:trainingId/notify",
    element: <AdminTrainingNotification />,
  },
  {
    path: "users",
    element: <AdminUsers />,
  },
  {
    path: "users/:userId/edit",
    element: <AdminUserEdit />,
  },
  {
    path: "news",
    element: <AdminNews />,
  },
  {
    path: "news/create",
    element: <AdminNewsCreate />,
  },
  {
    path: "news/:newsId/edit",
    element: <AdminNewsEdit />,
  },
  {
    path: "documents",
    element: <AdminDocuments />,
  },
  {
    path: "document-types",
    element: <AdminDocumentTypes />,
  },
  {
    path: "contacts",
    element: <AdminContacts />,
  },
  {
    path: "attendance-sheets",
    element: <AdminAttendanceSheets />,
  },
  {
    path: "notification-settings",
    element: <AdminNotificationSettings />,
  },
  {
    path: "notification-templates",
    element: <AdminNotificationTemplates />,
  },
  {
    path: "instant-notifications",
    element: <AdminInstantNotifications />,
  },
  ...adminSettingsRoutes,
];

export default adminRoutes;