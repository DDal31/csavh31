import { Navigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
      }
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: session, isError: sessionError } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        return session;
      } catch (error) {
        console.error("Session error:", error);
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        // Force sign out on session error
        await supabase.auth.signOut();
        throw error;
      }
    },
    retry: false
  });

  const { data: profile, isLoading, isError: profileError } = useQuery({
    queryKey: ["profile", session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      console.log("Fetching profile for user:", session?.user?.id);
      try {
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
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre profil",
          variant: "destructive"
        });
        throw error;
      }
    },
  });

  // Handle authentication errors
  if (sessionError || profileError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!session) {
    console.log("No session found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Vérification explicite du rôle admin
  if (requireAdmin) {
    console.log("Checking admin role. Profile:", profile);
    console.log("Site role:", profile?.site_role);
    
    if (!profile || profile.site_role !== "admin") {
      console.log("User is not admin, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}