import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateUserForm from "@/components/admin/CreateUserForm";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { AdminUsersHeader } from "@/components/admin/users/AdminUsersHeader";
import PageTransition from "@/components/animations/PageTransition";
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
          userData: data
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

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: { 
          method: 'DELETE_USER',
          userId 
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès",
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
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
      <PageTransition>
        <main className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <AdminUsersHeader onNewUser={() => setIsCreateDialogOpen(true)} />

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Créer un nouvel utilisateur</DialogTitle>
              </DialogHeader>
              <CreateUserForm
                onSubmit={handleCreateUser}
                isLoading={false}
                onBack={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <UsersTable
            users={users}
            onDeleteUser={handleDeleteUser}
          />
        </div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
};

export default AdminUsers;
