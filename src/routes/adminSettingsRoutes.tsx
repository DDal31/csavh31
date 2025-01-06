import { lazy } from "react";
import { RouteObject } from "react-router-dom";

const AdminPresentation = lazy(() => import("@/pages/AdminPresentation"));
const AdminContacts = lazy(() => import("@/pages/AdminContacts"));
const AdminNews = lazy(() => import("@/pages/AdminNews"));
const AdminSportsTeams = lazy(() => import("@/pages/AdminSportsTeams"));
const AdminDocumentTypes = lazy(() => import("@/pages/AdminDocumentTypes"));
const AdminAttendanceSheets = lazy(() => import("@/pages/AdminAttendanceSheets"));
const AdminSiteSettings = lazy(() => import("@/pages/AdminSiteSettings"));
const AdminNotificationSettings = lazy(() => import("@/pages/AdminNotificationSettings"));
const AdminTemplates = lazy(() => import("@/pages/AdminTemplates"));

export const adminSettingsRoutes: RouteObject[] = [
  {
    path: "presentation",
    element: <AdminPresentation />,
  },
  {
    path: "contacts",
    element: <AdminContacts />,
  },
  {
    path: "news",
    element: <AdminNews />,
  },
  {
    path: "sports-teams",
    element: <AdminSportsTeams />,
  },
  {
    path: "document-types",
    element: <AdminDocumentTypes />,
  },
  {
    path: "attendance-sheets",
    element: <AdminAttendanceSheets />,
  },
  {
    path: "site",
    element: <AdminSiteSettings />,
  },
  {
    path: "notifications",
    element: <AdminNotificationSettings />,
  },
  {
    path: "templates",
    element: <AdminTemplates />,
  },
];