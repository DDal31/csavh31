import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  club_role: z.enum(["joueur", "entraineur", "arbitre", "joueur-entraineur", "joueur-arbitre", "entraineur-arbitre", "les-trois"]),
  sport: z.enum(["goalball", "torball", "both"]),
  team: z.enum(["loisir", "d1_masculine", "d1_feminine"]),
  site_role: z.enum(["member", "admin"])
});

export type ProfileFormData = z.infer<typeof profileSchema>;