import { Navigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { AuthError, AuthChangeEvent } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      console.log("Auth state changed:", event, "Session:", session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing session");
        queryClient.clear();
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }

      if (event === 'TOKEN_REFRESHED') {
        if (!session) {
          console.error("Token refresh failed - no session");
          await handleSignOut();
          return;
        }
        console.log("Token refreshed successfully");
        queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter",
        variant: "destructive"
      });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

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
        await handleSignOut();
        throw error;
      }
    },
    retry: false,
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
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (!data) {
          console.log("No profile found for user");
          return null;
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
    retry: false,
  });

  if (sessionLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (sessionError || profileError || !session) {
    console.log("Auth error or no session, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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