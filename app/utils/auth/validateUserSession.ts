import axiosClient from "../api/axiosClient";
import { extractAuthToken } from "./extractAdminAuthToken";

export async function validateUserSession(request: Request) {
  try {
    // get cookie
    const cookieHeader = request.headers.get("Cookie");

    // get admin auth token form cookie
    const token = extractAuthToken(cookieHeader);

    // 
    if (!token) {
      return null;
    }

    const response = await axiosClient.get("/api/adminauth/validate-user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    return null;
  }

}