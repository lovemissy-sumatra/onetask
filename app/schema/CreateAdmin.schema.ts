import { z } from "zod";

export const createAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Superadmin"]).catch("Admin"),
});

export type CreateAdminFormT = z.infer<typeof createAdminSchema>;
