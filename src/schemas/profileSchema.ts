import { z } from "zod";

export const profileSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().nullable(),
  password: z.string().optional(),
  club_role: z.enum(["joueur", "entraineur", "arbitre", "joueur-entraineur", "joueur-arbitre", "entraineur-arbitre", "les-trois"] as const),
  sport: z.enum(["goalball", "torball", "both"] as const),
  team: z.enum(["loisir", "d1_masculine", "d1_feminine"] as const),
  site_role: z.enum(["member", "admin"] as const)
});

export type ProfileFormData = z.infer<typeof profileSchema>;