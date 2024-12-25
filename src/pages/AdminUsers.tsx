import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/schemas/profileSchema";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ProfileEditForm from "@/components/ProfileEditForm";

interface User {
  id: string;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    club_role: string;
    sport: string;
    team: string;
    site_role: string;
  };
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      club_role: "joueur",
      sport: "goalball",
      team: "loisir",
      site_role: "member"
    }
  });

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

  const handleCreateUser = async (data: any) => {
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
      form.reset();
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

  const handleUpdateProfile = async (data: any) => {
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              Gestion des Utilisateurs
            </h1>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
                  <Input
                    {...form.register("email")}
                    type="email"
                    placeholder="Email"
                  />
                  <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="Mot de passe"
                  />
                  <ProfileEditForm
                    profile={{
                      id: "",
                      first_name: "",
                      last_name: "",
                      email: "",
                      phone: "",
                      club_role: "joueur",
                      sport: "goalball",
                      team: "loisir",
                      site_role: "member",
                      created_at: "",
                      updated_at: ""
                    }}
                    onSubmit={handleCreateUser}
                    isLoading={false}
                  />
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle Club</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead>Rôle Site</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.profile?.first_name}</TableCell>
                    <TableCell>{user.profile?.last_name}</TableCell>
                    <TableCell>{user.profile?.club_role}</TableCell>
                    <TableCell>{user.profile?.sport}</TableCell>
                    <TableCell>{user.profile?.team}</TableCell>
                    <TableCell>{user.profile?.site_role}</TableCell>
                    <TableCell>
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le profil</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <ProfileEditForm
                              profile={selectedUser.profile}
                              onSubmit={handleUpdateProfile}
                              isLoading={false}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminUsers;