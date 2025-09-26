import z from "zod";
import type { User } from "./User.schema";

export type LoginResultT =  {
  success: boolean;
  error?: string;
  user?: User;
}

export const LoginFormSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginFormT = z.infer<typeof LoginFormSchema>;