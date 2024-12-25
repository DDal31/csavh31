import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CreateUserForm from "@/components/admin/CreateUserForm";
import UsersList from "@/components/admin/UsersList";
import type { Profile } from "@/types/profile";
import type { CreateUserData } from "@/types/auth";

interface User {
  id: string;
  email: string;
  profile: Profile;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("site_role")
          .eq("id", session.user.id)
          .single();

        if (!profile || profile.site_role !== "admin") {
          navigate("/dashboard");
          return;
        }

        fetchUsers();
      } catch (error) {
        console.error("Erreur lors de la vérification des droits admin:", error);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { method: 'GET_USERS' }
      });

      if (error) throw error;
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des utilisateurs",
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async (data: CreateUserData) => {
    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: {
          method: 'CREATE_USER',
          userData: {
            email: data.email,
            password: data.password,
            profile: {
              first_name: data.first_name,
              last_name: data.last_name,
              phone: data.phone,
              club_role: data.club_role,
              sport: data.sport,
              team: data.team,
              site_role: data.site_role
            }
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'utilisateur a été créé avec succès",
      });
      
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async (data: Profile) => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          club_role: data.club_role,
          sport: data.sport,
          team: data.team,
          site_role: data.site_role
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le profil a été mis à jour avec succès",
      });
      
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-8">
            <Button 
              variant="ghost" 
              className="text-white w-fit flex items-center gap-2 hover:text-gray-300"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Button>

            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold text-white">
                Gestion des Utilisateurs
              </h1>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Nouvel Utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Créer un nouvel utilisateur</DialogTitle>
                  </DialogHeader>
                  <CreateUserForm
                    onSubmit={handleCreateUser}
                    isLoading={false}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <UsersList
              users={users}
              onUpdateProfile={handleUpdateProfile}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              isEditDialogOpen={isEditDialogOpen}
              setIsEditDialogOpen={setIsEditDialogOpen}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;