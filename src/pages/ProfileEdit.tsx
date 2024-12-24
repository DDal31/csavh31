import React from "react"; // Add this import
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/profile";

const formSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  phone: z.string().nullable(),
  club_role: z.enum(['joueur', 'entraineur', 'arbitre', 'joueur-entraineur', 'joueur-arbitre', 'entraineur-arbitre', 'les-trois']),
  sport: z.enum(['goalball', 'torball', 'both']),
  team: z.enum(['loisir', 'd1_masculine', 'd1_feminine']),
});

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Non connecté");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      club_role: "joueur",
      sport: "goalball",
      team: "loisir",
    },
  });

  React.useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        club_role: profile.club_role,
        sport: profile.sport,
        team: profile.team,
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Non connecté");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos modifications ont été enregistrées",
      });
      navigate("/profile");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Modifier mon profil</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
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
                    <FormLabel>Rôle dans le club</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="joueur">Joueur</SelectItem>
                        <SelectItem value="entraineur">Entraîneur</SelectItem>
                        <SelectItem value="arbitre">Arbitre</SelectItem>
                        <SelectItem value="joueur-entraineur">Joueur-Entraîneur</SelectItem>
                        <SelectItem value="joueur-arbitre">Joueur-Arbitre</SelectItem>
                        <SelectItem value="entraineur-arbitre">Entraîneur-Arbitre</SelectItem>
                        <SelectItem value="les-trois">Les trois</SelectItem>
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
                    <FormLabel>Sport</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>Équipe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate("/profile")}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileEdit;