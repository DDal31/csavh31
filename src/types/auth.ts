import type { ProfileFormData } from "@/schemas/profileSchema";

export interface CreateUserData extends ProfileFormData {
  password: string;
}

// New type for admin user editing without password
export type AdminUserEditData = Omit<CreateUserData, 'password'>;