import axios from "axios";
import apiUrl from "./apiUrl";

const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// allows overwriting
axiosClient.interceptors.request.use((configuration) => {
  configuration.withCredentials = true;
  return configuration;
});

export default axiosClient;