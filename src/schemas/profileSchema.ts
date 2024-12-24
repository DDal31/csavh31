import * as z from "zod";

export const profileFormSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  phone: z.string().nullable(),
  club_role: z.enum(['joueur', 'entraineur', 'arbitre', 'joueur-entraineur', 'joueur-arbitre', 'entraineur-arbitre', 'les-trois']),
  sport: z.enum(['goalball', 'torball', 'both']),
  team: z.enum(['loisir', 'd1_masculine', 'd1_feminine']),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;