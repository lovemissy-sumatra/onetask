import apiUrl from "~/utils/api/apiUrl";
import axiosClient from "~/utils/api/axiosClient";
import { extractErrorMessage } from "~/utils/formatting/extractErrorMessage";

export async function logoutUser(): Promise<void> {
  try {
    await axiosClient.post(`${apiUrl}/api/adminauth/logout`);
  } catch (error: any) {
    console.error(extractErrorMessage(error.data.message, "Login failed. Please try again"));
  }
}