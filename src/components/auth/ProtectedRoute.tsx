import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();

  const { data: session, isLoading: isSessionLoading, isError: isSessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        throw error;
      }
      console.log("Session data:", session);
      return session;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
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
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Afficher le loader pendant le chargement initial
  if (isSessionLoading || (session && isProfileLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  // Gérer les erreurs de session ou de profil
  if (isSessionError || isProfileError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <ShieldAlert className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-white">Une erreur est survenue lors de la vérification des accès.</p>
        </div>
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