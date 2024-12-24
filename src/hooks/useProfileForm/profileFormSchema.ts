import * as z from "zod";

export const formSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().nullable(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").optional(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  club_role: z.enum(["joueur", "entraineur", "arbitre", "staff"]),
  sport: z.enum(["goalball", "torball", "both"]),
  team: z.enum(["loisir", "d1_masculine", "d1_feminine"]),
});

export type ProfileFormValues = z.infer<typeof formSchema>;