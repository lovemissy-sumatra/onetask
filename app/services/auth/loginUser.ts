import type { LoginResultT } from "~/schema/Login.schema";
import axiosClient from "~/utils/api/axiosClient";
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage";

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
      error: extractErrorMessage(error, "Login failed"),
    };
  }
}
