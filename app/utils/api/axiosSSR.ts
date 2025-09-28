import axiosClient from "./axiosClient";

export function axiosSSR(request?: Request) {
  const cookieHeader = request?.headers?.get("Cookie");

  return axiosClient.create({
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
}
