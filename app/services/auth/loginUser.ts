import type { LoginResultT } from "~/schema/Login.schema";
import axiosClient from "~/utils/api/axiosClient";

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResultT> {
  try {
    const response = await axiosClient.post("/api/adminauth/login", {
      username,
      password,
    });

    return { success: true, user: response.data };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Login failed",
    };
  }
}
