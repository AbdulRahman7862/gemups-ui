import axios, { AxiosInstance } from "axios";
import { clearAllAuthCookies, getAuthToken } from "./authCookies";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is not defined in environment variables.");
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = getAuthToken();
      if (token) {
        clearAllAuthCookies();
      }
    }
    return Promise.reject(error);
  }
);

// NOTE: getAuthToken and clearAllAuthCookies now use localStorage instead of cookies.
export { axiosInstance, baseURL };
export default axiosInstance;
