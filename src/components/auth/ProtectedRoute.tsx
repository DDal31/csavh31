import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log("Fetching profile for user:", session?.user?.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      console.log("Profile data:", data);
      return data;
    },
  });

  // Afficher le loader pendant le chargement de la session ou du profil
  if (isSessionLoading || (session && isProfileLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Rediriger vers la page de connexion si pas de session
  if (!session) {
    console.log("No session found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle admin
  if (requireAdmin && profile) {
    console.log("Checking admin role. Profile:", profile);
    console.log("Site role:", profile.site_role);
    
    if (profile.site_role !== "admin") {
      console.log("User is not admin, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}