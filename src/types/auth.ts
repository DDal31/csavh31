import type { ProfileFormData } from "@/schemas/profileSchema";

export interface CreateUserData extends ProfileFormData {
  password: string;
}