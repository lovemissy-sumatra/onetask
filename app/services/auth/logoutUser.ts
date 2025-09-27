import apiUrl from "~/utils/api/apiUrl";
import axiosClient from "~/utils/api/axiosClient";

export async function logoutUser(): Promise<void> {
  try {
    await axiosClient.post(`${apiUrl}/api/adminauth/logout`);
  } catch (error) {
    console.error('Logout failed:', error);
  }
}