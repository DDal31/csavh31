import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTiles } from "@/components/dashboard/DashboardTiles";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSports, setUserSports] = useState<string[]>([]);
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        if (!isMounted) return;

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          if (retryCount < maxRetries) {
            console.log(`Retrying profile fetch (attempt ${retryCount + 1}/${maxRetries})...`);
            timeoutId = setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 1000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          
          toast({
            title: "Erreur",
            description: "Impossible de charger votre profil. Veuillez réessayer.",
            variant: "destructive",
          });
          return;
        }

        if (!isMounted) return;

        if (profile) {
          console.log("Profile loaded successfully");
          setIsAdmin(profile.site_role === "admin");
          const sports = profile.sport.split(',').map((s: string) => s.trim());
          setUserSports(sports);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Authentication check error:", error);
        if (!isMounted) return;
        
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de l'authentification",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate, retryCount, toast]);

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" role="status" aria-label="Chargement en cours">
        <Loader2 className="h-8 w-8 animate-spin text-white" aria-hidden="true" />
        <span className="sr-only">Chargement en cours...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-12" role="main">
        <div className="max-w-6xl mx-auto">
          <DashboardHeader onSignOut={handleSignOut} />
          <DashboardTiles isAdmin={isAdmin} userSports={userSports} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;