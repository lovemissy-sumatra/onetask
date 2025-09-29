import axiosClient from "./axiosClient";


// creates an instance of axios with cookie, if available
export function axiosSSR(request?: Request) {
  const cookieHeader = request?.headers?.get("Cookie");

  return axiosClient.create({
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
  });
}
