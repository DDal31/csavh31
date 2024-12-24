import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().nullable(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").optional(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  club_role: z.enum(["joueur", "entraineur", "arbitre", "staff"]),
  sport: z.enum(["goalball", "torball", "both"]),
  team: z.enum(["loisir", "d1_masculine", "d1_feminine"]),
});

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      password: "",
      first_name: "",
      last_name: "",
      club_role: "joueur",
      sport: "goalball",
      team: "loisir",
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Charger les données du profil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        // Charger les données de l'utilisateur
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        form.reset({
          email: user?.email || "",
          phone: user?.phone || "",
          password: "",
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          club_role: profileData.club_role,
          sport: profileData.sport,
          team: profileData.team,
        });
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, toast, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Mettre à jour le profil dans la table profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          club_role: values.club_role,
          sport: values.sport,
          team: values.team,
        })
        .eq("id", session.user.id);

      if (profileError) throw profileError;

      // Mettre à jour l'email et le téléphone dans auth.users
      const { error: userError } = await supabase.auth.updateUser({
        email: values.email,
        phone: values.phone,
        ...(values.password ? { password: values.password } : {}),
      });

      if (userError) throw userError;

      toast({
        title: "Succès",
        description: "Votre profil a été mis à jour",
      });

      navigate("/profile");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
      });
    } finally {
      setLoading(false);
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
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              className="text-white hover:bg-gray-800"
              onClick={() => navigate("/profile")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-6">
              Modifier mon profil
            </h1>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="bg-white/5 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" className="bg-white/5 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Nouveau mot de passe (optionnel)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="password" className="bg-white/5 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white/5 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Nom</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-white/5 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="club_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Rôle dans le club</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 text-white">
                            <SelectValue placeholder="Sélectionnez votre rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="joueur">Joueur</SelectItem>
                          <SelectItem value="entraineur">Entraîneur</SelectItem>
                          <SelectItem value="arbitre">Arbitre</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Sport</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 text-white">
                            <SelectValue placeholder="Sélectionnez votre sport" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="goalball">Goalball</SelectItem>
                          <SelectItem value="torball">Torball</SelectItem>
                          <SelectItem value="both">Les deux</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Équipe</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 text-white">
                            <SelectValue placeholder="Sélectionnez votre équipe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="loisir">Loisir</SelectItem>
                          <SelectItem value="d1_masculine">D1 Masculine</SelectItem>
                          <SelectItem value="d1_feminine">D1 Féminine</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfileEdit;