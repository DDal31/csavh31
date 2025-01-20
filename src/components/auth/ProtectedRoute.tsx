import { Navigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthTokenResponse, User } from '@supabase/supabase-js';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.id);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing session");
        queryClient.invalidateQueries({ queryKey: ["session"] });
        queryClient.clear();
      }

      // Handle token refresh errors
      if (event === 'TOKEN_REFRESH_FAILED') {
        console.error("Token refresh failed, signing out user");
        supabase.auth.signOut().catch(console.error);
        queryClient.clear();
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  const { data: session, isError: sessionError, isLoading: sessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      try {
        console.log("Fetching current session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }

        if (!session) {
          console.log("No active session found");
          return null;
        }

        console.log("Valid session found for user:", session.user.id);
        return session;
      } catch (error) {
        console.error("Session error:", error);
        // Force sign out on session error
        await supabase.auth.signOut();
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter",
          variant: "destructive"
        });
        throw error;
      }
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Consider session data stale after 5 minutes
  });

  const { data: profile, isLoading: profileLoading, isError: profileError } = useQuery({
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

  // Handle loading states
  if (sessionLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Handle authentication errors
  if (sessionError || profileError || !session) {
    console.log("Auth error or no session, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
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