import type { AuthResult } from "~/schema/Auth.schema";
import axiosClient from "~/utils/api/axiosClient";

export async function validateUserSession(request?: Request): Promise<AuthResult> {
  try {
    const headers: Record<string, string> = {
      "X-Requested-With": "XMLHttpRequest",
    };

    if (request && typeof window === "undefined") {
      const cookieHeader = request.headers.get("Cookie");
      if (cookieHeader) {
        headers.Cookie = cookieHeader;
      }
    }

    const response = await axiosClient.get("/api/adminauth/validate-user", {
      headers,
      withCredentials: true
    });

    return { user: response.data, success: true };
  } catch (error: any) {
    console.error("Auth validation failed:", error);
    return { user: null, success: false };
  }
}
