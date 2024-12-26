import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import type { Profile } from "@/types/profile";
import type { ProfileFormData } from "@/schemas/profileSchema";

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      try {
        console.log("Fetching profile for user:", session.user.id);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (!data) {
          console.log("No profile found for user");
          toast({
            title: "Erreur",
            description: "Profil non trouvé",
            variant: "destructive",
          });
          return;
        }

        console.log("Profile fetched successfully:", data);
        setProfile(data);
      } catch (error) {
        console.error("Error in profile fetch:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    setUpdating(true);
    console.log("Updating profile with data:", data);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", profile.id);

      if (error) throw error;

      console.log("Profile updated successfully");
      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Profil non trouvé</p>
          <Button onClick={() => navigate("/dashboard")}>
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto">
          <ProfileHeader />
          <ProfileCard
            profile={profile}
            onSubmit={handleSubmit}
            isLoading={updating}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileEdit;