import axios from "axios";
import apiUrl from "./apiUrl";

// reusable axios instance
const axiosClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// allows to be reconfigured every use, such as attaching cookie
axiosClient.interceptors.request.use((configuration) => {
  configuration.withCredentials = true;
  return configuration;
});

export default axiosClient;