import { z } from "zod";

export const profileSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  password: z.string().optional(),
  club_role: z.enum(["joueur", "entraineur", "arbitre", "joueur-entraineur", "joueur-arbitre", "entraineur-arbitre", "les-trois"]),
  sport: z.string(),
  team: z.string(),
  site_role: z.enum(["member", "admin"]),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type ProfileFormData = z.infer<typeof profileSchema>;