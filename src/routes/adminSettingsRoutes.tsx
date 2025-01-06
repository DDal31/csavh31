import { Route } from "react-router-dom";
import { lazy } from "react";

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
      <Route path="presentation" element={<AdminPresentation />} />
      <Route path="contacts" element={<AdminContacts />} />
      <Route path="news" element={<AdminNews />} />
      <Route path="sports-teams" element={<AdminSportsTeams />} />
      <Route path="document-types" element={<AdminDocumentTypes />} />
      <Route path="attendance-sheets" element={<AdminAttendanceSheets />} />
      <Route path="site" element={<AdminSiteSettings />} />
      <Route path="notifications" element={<AdminNotificationSettings />} />
      <Route path="templates" element={<AdminTemplates />} />
    </>
  );
};