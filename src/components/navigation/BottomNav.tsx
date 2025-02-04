import { useNavigate, useLocation } from "react-router-dom";
import { Home, Activity, Calendar, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setIsAdmin(profile.site_role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      label: "Accueil",
      icon: Home,
      path: "/dashboard",
      ariaLabel: "Aller au tableau de bord"
    },
    {
      label: "Entrainement",
      icon: Activity,
      path: "/training",
      ariaLabel: "Aller à la page des entraînements"
    },
    {
      label: "Présences",
      icon: Calendar,
      path: "/attendance",
      ariaLabel: "Aller à la page des présences"
    },
    {
      label: "Documents",
      icon: FileText,
      path: "/documents",
      ariaLabel: "Aller à la page des documents"
    }
  ];

  if (isAdmin) {
    navItems.push({
      label: "Admin",
      icon: Shield,
      path: "/admin",
      ariaLabel: "Aller au tableau de bord administrateur"
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                "hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400",
                isActive(item.path) ? "text-white" : "text-gray-400"
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive(item.path) ? "page" : undefined}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};