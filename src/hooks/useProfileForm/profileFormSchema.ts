import * as z from "zod";

const clubRoleEnum = ["joueur", "entraineur", "arbitre", "staff"] as const;
const sportEnum = ["goalball", "torball", "both"] as const;
const teamEnum = ["loisir", "d1_masculine", "d1_feminine"] as const;

export type ClubRole = typeof clubRoleEnum[number];
export type Sport = typeof sportEnum[number];
export type Team = typeof teamEnum[number];

export const formSchema = z.object({
  email: z.string().email("Email invalide"),
  phone: z.string().nullable(),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères").optional(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  club_role: z.enum(clubRoleEnum),
  sport: z.enum(sportEnum),
  team: z.enum(teamEnum),
});

export type ProfileFormValues = z.infer<typeof formSchema>;