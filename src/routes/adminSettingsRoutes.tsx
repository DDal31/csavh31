import AdminNotificationSettings from "@/pages/AdminNotificationSettings";
import AdminInstantNotifications from "@/pages/AdminInstantNotifications";

const adminSettingsRoutes = [
  {
    path: "notifications",
    element: <AdminNotificationSettings />,
  },
  {
    path: "notifications/instant",
    element: <AdminInstantNotifications />,
  },
];

export default adminSettingsRoutes;
