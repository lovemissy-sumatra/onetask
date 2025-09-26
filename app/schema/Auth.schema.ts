import type { User } from "./User.schema";

export type AuthResult = {
  user: User | null;
  success: boolean;
}
