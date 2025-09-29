import type { AuthResult } from "~/schema/Auth.schema";
import axiosClient from "~/utils/api/axiosClient";
import { axiosSSR } from "~/utils/api/axiosSSR";

export async function validateUserSession(request?: Request): Promise<AuthResult> {
  try {
    const client = request ? axiosSSR(request) : undefined;

    const response = await (client ?? axiosClient).get("/api/adminauth/validate-user", {
      withCredentials: true,
    });

    return { user: response.data, success: true };
  } catch (error: any) {
    return { user: null, success: false };
  }
}
