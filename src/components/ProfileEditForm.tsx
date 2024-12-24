import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { profileFormSchema, type ProfileFormValues } from "@/schemas/profileSchema";
import type { Profile } from "@/types/profile";

interface ProfileEditFormProps {
  profile: Profile;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ProfileEditForm = ({ profile, onSubmit, onCancel, isLoading }: ProfileEditFormProps) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      club_role: profile.club_role,
      sport: profile.sport,
      team: profile.team,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
};