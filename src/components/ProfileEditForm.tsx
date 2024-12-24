import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProfileForm, ProfileFormValues } from "@/hooks/useProfileForm";
import { useEffect } from "react";

export const ProfileEditForm = () => {
  const { form, loading, loadProfile, onSubmit } = useProfileForm();

  useEffect(() => {
    loadProfile();
  }, []);

  return (
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
  );
};