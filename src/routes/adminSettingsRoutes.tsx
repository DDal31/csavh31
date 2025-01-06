import { Route } from "react-router-dom";
import { lazy } from "react";

const AdminSiteSettings = lazy(() => import("@/pages/AdminSiteSettings"));
const AdminNotificationSettings = lazy(() => import("@/pages/AdminNotificationSettings"));

export const AdminSettingsRoutes = () => {
  return (
    <>
      <Route path="site" element={<AdminSiteSettings />} />
      <Route path="notifications" element={<AdminNotificationSettings />} />
    </>
  );
};