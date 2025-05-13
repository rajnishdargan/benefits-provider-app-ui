import axios from "axios";

// Create a generic Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_PROVIDER_BASE_URL, // Base URL for all API calls
  headers: {
    accept: "application/json",
  },
});

// Add a request interceptor to include the Authorization token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor for error handling (optional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default apiClient;