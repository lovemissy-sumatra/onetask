import axiosClient from "./axiosClient";

export async function userSession(request: Request) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const accessToken = cookieHeader?.match(/AdminAuthToken=([^;]+)/)?.[1];

    if (!accessToken) {
      return null;
    }

    const response = await axiosClient.get("/api/adminauth/validate-user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    return null;
  }

}