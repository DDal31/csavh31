
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUserEditForm } from "@/components/admin/users/form/AdminUserEditForm";
import { PasswordChangeSection } from "@/components/admin/users/form/PasswordChangeSection";
import type { Profile } from "@/types/profile";

const AdminUserEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: adminProfile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!adminProfile || adminProfile.site_role !== "admin") {
          navigate("/dashboard");
          return;
        }

        console.log("Fetching profile for user:", userId);
        const { data: userProfile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        if (!userProfile) {
          console.log("No profile found for user");
          toast({
            title: "Erreur",
            description: "Profil non trouvé",
            variant: "destructive",
          });
          navigate("/admin/users");
          return;
        }

        console.log("Profile fetched successfully:", userProfile);
        setProfile(userProfile);
      } catch (error) {
        console.error("Error in profile fetch:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        });
        navigate("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchProfile();
  }, [navigate, toast, userId]);

  const handleSubmit = async (data: Omit<Profile, "id" | "created_at" | "updated_at">) => {
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
        description: "Le profil a été mis à jour",
      });
      
      navigate("/admin/users");
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Profil non trouvé</p>
          <Button onClick={() => navigate("/admin/users")}>
            Retour à la liste des utilisateurs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button 
            variant="ghost" 
            className="text-white mb-6 hover:text-gray-300"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste des utilisateurs
          </Button>
          
          <h1 className="text-2xl font-bold text-white mb-6">
            Modifier le profil de {profile.first_name} {profile.last_name}
          </h1>

          <AdminUserEditForm
            profile={profile}
            onSubmit={handleSubmit}
            isLoading={updating}
          />

          <PasswordChangeSection
            userId={profile.id}
            userName={`${profile.first_name} ${profile.last_name}`}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUserEdit;
