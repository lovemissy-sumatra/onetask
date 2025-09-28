import axios from "axios";
import apiUrl from "./apiUrl";

const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use((configuration) => {
  configuration.withCredentials = true;
  return configuration;
});

export function setSSRRequestCookies(cookieHeader?: string) {
  if (cookieHeader) {
    axiosClient.defaults.headers.Cookie = cookieHeader;
  } else {
    delete axiosClient.defaults.headers.Cookie;
  }
}


export default axiosClient;